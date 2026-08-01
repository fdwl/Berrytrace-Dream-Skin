function getFinalToolName(toolName, pluginId, allowedPrefixes) {
    const parts = pluginId.split('.');
    const lastPart = parts[parts.length - 1] || '';
    const defaultPrefix = lastPart.replace(/-/g, '_').toLowerCase().replace(/_tools$/, '').replace(/_agent$/, '');
    const prefixes = allowedPrefixes && allowedPrefixes.length > 0
        ? allowedPrefixes.map(p => p.toLowerCase())
        : [defaultPrefix];
    // 校验工具名是否以允许的前缀开头
    let hasValidPrefix = false;
    for (const p of prefixes) {
        if (toolName.startsWith(p + '_')) {
            hasValidPrefix = true;
            break;
        }
    }
    if (!hasValidPrefix && pluginId !== 'berrytrace.host' && pluginId !== '') {
        console.warn(`[PluginsSDK] Warning: Tool "${toolName}" from plugin "${pluginId}" does not follow the naming standard. It should be prefixed with "${prefixes[0]}_".`);
    }
    return toolName;
}
export class Plugin {
    app;
    manifest;
    constructor(app, manifest) {
        this.app = app;
        this.manifest = manifest;
    }
}
export class View {
    container;
    app;
    constructor(container, app) {
        this.container = container;
        this.app = app;
    }
    /**
     * Tab 关闭前调用。
     * @returns true — 允许关闭；false — 阻止关闭；string — 弹出确认框，确认后关闭
     */
    async beforeClose() {
        return true;
    }
}
export function createPluginSDK(pluginId, options) {
    // 同时支持 utilityProcess（parentPort）和 child_process.fork（process.send）
    // 优先级：parentPort（Electron utilityProcess）> process.send（Node.js child_process.fork）
    const isNodeBackground = typeof process !== 'undefined' && process.versions && process.versions.node
        && (process.parentPort || process.send);
    const isElectronRenderer = typeof window !== 'undefined' && window.electronAPI;
    const isIframeRenderer = typeof window !== 'undefined' && window.parent && window.parent !== window;
    const callbackMap = new Map();
    let callbackCounter = 1;
    const commandHandlers = new Map();
    function registerCallback(fn) {
        const callbackId = `cb_${Date.now()}_${callbackCounter++}`;
        callbackMap.set(callbackId, fn);
        return { __callbackId: callbackId };
    }
    function processArgs(args) {
        if (!args)
            return [];
        return args.map(arg => {
            if (typeof arg === 'function') {
                return registerCallback(arg);
            }
            return arg;
        });
    }
    let callApiImpl;
    let callApiResultImpl;
    let onEventImpl;
    let emitEventImpl;
    let postMessageImpl = () => { };
    let sendToHost = () => { };
    if (isNodeBackground) {
        // ── 进程池模式检测 ──────────────────────────────────────────────────────
        // Host Runner 在加载插件前设置 globalThis.__pluginPoolRouter。
        // 存在时，SDK 委托给 Host Runner 的消息路由器，而非直接监听 parentPort/process.send。
        // 这使得多个插件可共享一个进程，每个插件有独立的 SDK 实例和消息路由。
        const poolRouter = (typeof globalThis !== 'undefined' && globalThis.__pluginPoolRouter) || null;
        // ── 检测底层通信通道：parentPort（utilityProcess）或 process.send（child_process.fork）────
        const parentPort = process.parentPort;
        const childProcess = process.send ? process : null;
        // 发送消息的抽象函数（根据通道类型选择正确的 API）
        // 所有出站消息自动附加 sourcePluginId，主进程据此识别消息来源插件
        // （进程池模式下多个插件共享同一进程，必须靠此字段区分）
        sendToHost = (msg) => {
            const tagged = { ...msg, sourcePluginId: pluginId };
            if (poolRouter) {
                poolRouter.send(tagged);
            }
            else if (parentPort) {
                parentPort.postMessage(tagged);
            }
            else if (childProcess) {
                childProcess.send(tagged);
            }
        };
        let directPort = null;
        class ThrottledEventEmitter {
            pendingPayloads = new Map();
            activeTimers = new Map();
            emit(eventName, payload, port) {
                if (eventName.startsWith('progress:') || eventName === 'plugin:silent-setup-progress') {
                    this.pendingPayloads.set(eventName, payload);
                    if (!this.activeTimers.has(eventName)) {
                        const timer = setTimeout(() => {
                            this.activeTimers.delete(eventName);
                            const latestPayload = this.pendingPayloads.get(eventName);
                            this.pendingPayloads.delete(eventName);
                            if (latestPayload) {
                                port.postMessage({ type: 'sdk:events:emit', eventName, payload: latestPayload });
                            }
                        }, 50);
                        this.activeTimers.set(eventName, timer);
                    }
                }
                else {
                    port.postMessage({ type: 'sdk:events:emit', eventName, payload });
                }
            }
        }
        const throttledEmitter = new ThrottledEventEmitter();
        const bindDirectPort = (port) => {
            if (directPort) {
                try {
                    directPort.close();
                }
                catch (e) {
                    console.warn(`[SDK:${pluginId}] Failed to close previous direct port:`, e);
                }
            }
            directPort = port;
            directPort.on('message', (msg) => {
                if (!msg)
                    return;
                if (msg.type === 'sdk:callback') {
                    const { callbackId, args } = msg;
                    const cb = callbackMap.get(callbackId);
                    if (cb)
                        cb(...args);
                }
                else if (msg.type === 'sdk:events:emit') {
                    const { eventName, payload } = msg;
                    const cbList = callbackMap.get(`evt:${eventName}`);
                    if (cbList) {
                        for (const cb of cbList) {
                            try {
                                cb(payload);
                            }
                            catch (err) {
                                console.error(err);
                            }
                        }
                    }
                }
            });
            directPort.start();
            console.log(`[SDK:${pluginId}] Direct MessagePort connected.`);
        };
        postMessageImpl = (msg) => {
            const isHighFreqStreamEvent = msg && msg.type === 'sdk:events:emit' &&
                (msg.eventName === 'agent:step_update' || msg.eventName === 'agent:stream_delta');
            if (directPort && (isHighFreqStreamEvent || msg.type === 'sdk:callApi:stream-chunk' || msg.type === 'sdk:callApi:stream-end' || msg.type === 'sdk:callApi:stream-error')) {
                directPort.postMessage(msg);
            }
            else {
                sendToHost(msg);
            }
        };
        const pendingCalls = new Map();
        let tokenCounter = 1;
        // 处理来自主进程的消息（utilityProcess 包装在 event.data 中，child_process.fork 直接传入）
        const messageHandler = async (event, sendHandle) => {
            const msg = parentPort ? event.data : (event && event.data !== undefined ? event.data : event);
            if (!msg)
                return;
            // 进程池模式：按 targetPluginId 过滤，只处理发给自己插件的消息
            // （Host Runner 会调用此 handler，但消息可能广播给池内所有插件）
            if (msg.targetPluginId && msg.targetPluginId !== pluginId)
                return;
            if (msg.type === 'plugin:connect-port' || msg.type === 'pool:connect-port') {
                const port = parentPort ? (event.ports && event.ports[0]) : (event && event.ports && event.ports[0] ? event.ports[0] : sendHandle);
                if (port) {
                    bindDirectPort(port);
                }
                return;
            }
            if (msg.type === 'sdk:callApi:response') {
                const { token, success, result, error } = msg;
                const pending = pendingCalls.get(token);
                if (pending) {
                    if (success)
                        pending.resolve(result);
                    else
                        pending.reject(new Error(error || 'callApi failed'));
                    pendingCalls.delete(token);
                }
                else {
                    // 诊断：响应到达但 token 已从 pendingCalls 移除（通常意味着已超时）
                    const now = Date.now();
                    console.warn(`[SDK:diag:${pluginId}] Response arrived AFTER timeout or resolve for token=${token} success=${success} (pendingCalls size=${pendingCalls.size})`);
                }
            }
            else if (msg.type === 'sdk:callback') {
                const { callbackId, args } = msg;
                const cb = callbackMap.get(callbackId);
                if (cb)
                    cb(...args);
            }
            else if (msg.type === 'sdk:events:on') {
                const { eventName, payload } = msg;
                if (eventName === 'commands:execute') {
                    const { commandId, args } = payload || {};
                    const handler = commandHandlers.get(commandId);
                    if (handler) {
                        try {
                            await handler(args);
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                }
                const cbList = callbackMap.get(`evt:${eventName}`);
                if (cbList) {
                    for (const cb of cbList) {
                        try {
                            cb(payload);
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                }
            }
            else if (msg.type === 'mcp:call-tool') {
                const { toolName, args, token } = msg;
                const key = `${pluginId}:${toolName}`;
                const win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : global);
                const handler = win._mcpHandlers?.get(key);
                console.log(`[SDK:${pluginId}] Received mcp:call-tool: toolName=${toolName}, token=${token}, key=${key}, hasHandler=${!!handler}`);
                if (handler) {
                    try {
                        const result = await handler(args);
                        sendToHost({
                            type: 'mcp:tool-response',
                            token,
                            success: true,
                            result
                        });
                    }
                    catch (err) {
                        sendToHost({
                            type: 'mcp:tool-response',
                            token,
                            success: false,
                            error: err.message || String(err)
                        });
                    }
                }
                else {
                    sendToHost({
                        type: 'mcp:tool-response',
                        token,
                        success: false,
                        error: `Tool handler for ${key} not registered in background process`
                    });
                }
            }
        };
        // ── 注册消息监听 ──────────────────────────────────────────────────────
        // 进程池模式：委托给 Host Runner 的路由器（Host Runner 拥有唯一的 parentPort 监听）
        // 独立进程模式：直接监听 parentPort / process.on('message')
        if (poolRouter) {
            poolRouter.register(pluginId, (evt) => messageHandler(evt));
        }
        else if (parentPort) {
            parentPort.on('message', (evt) => messageHandler(evt));
        }
        else if (childProcess) {
            childProcess.on('message', (msg, sendHandle) => messageHandler(msg, sendHandle));
        }
        callApiImpl = (apiName, methodName, args) => {
            return new Promise((resolve, reject) => {
                const token = tokenCounter++;
                const callStartTime = Date.now();
                pendingCalls.set(token, { resolve, reject, apiName, methodName, startTime: callStartTime });
                sendToHost({ type: 'sdk:callApi', token, apiName, methodName, args: processArgs(args) });
                // Timeout protection
                const isMcpCall = apiName === 'mcp' && methodName === 'callTool';
                const isAgentTask = apiName === 'agent' && methodName === 'executeTask';
                const timeoutDuration = isMcpCall || isAgentTask ? 10 * 60 * 1000 : 120000;
                // 诊断：对非 MCP/Agent 调用，30s 时发出预警（长超时 120s 太晚才发现问题）
                const diagTimer = !(isMcpCall || isAgentTask) ? setTimeout(() => {
                    if (pendingCalls.has(token)) {
                        const waited = Date.now() - callStartTime;
                        console.warn(`[SDK:diag:${pluginId}] API call pending >30s: ${apiName}.${methodName} token=${token} waited=${waited}ms poolMode=${!!poolRouter}`);
                    }
                }, 30000) : null;
                setTimeout(() => {
                    if (pendingCalls.has(token)) {
                        const waited = Date.now() - callStartTime;
                        console.error(`[SDK:diag:${pluginId}] API call TIMED OUT: ${apiName}.${methodName} token=${token} waited=${waited}ms poolMode=${!!poolRouter} pendingCount=${pendingCalls.size}`);
                        pendingCalls.delete(token);
                        reject(new Error(`Timeout: ${apiName}.${methodName}`));
                    }
                    if (diagTimer)
                        clearTimeout(diagTimer);
                }, timeoutDuration);
            });
        };
        callApiResultImpl = (apiName, methodName, args, _timeoutMs) => callApiImpl(apiName, methodName, args);
        let manifestPromise = null;
        const getManifest = () => {
            if (!manifestPromise) {
                manifestPromise = callApiImpl('plugin', 'getInfo').then((info) => info?.manifest).catch(() => null);
            }
            return manifestPromise;
        };
        onEventImpl = (eventName, cb) => {
            if (isNodeBackground) {
                getManifest().then((manifest) => {
                    if (manifest) {
                        const listens = manifest.contributes?.events?.listens || [];
                        const isDeclared = listens.some((item) => item.name === eventName);
                        const prefixes = ['agent:', 'workspace:', 'context:', 'system:', 'plugins:', 'voice:'];
                        const isPlatformEvent = prefixes.some(p => eventName.startsWith(p));
                        if (isPlatformEvent && eventName !== 'commands:execute' && !isDeclared) {
                            console.warn(`\x1b[33m[SDK:WARN:${pluginId}] Event "${eventName}" is listened in code but NOT declared in plugin.json listens list! CROSS-PROCESS MESSAGES WILL BE SILENTLY LOST.\x1b[0m`);
                        }
                    }
                }).catch(() => { });
            }
            const key = `evt:${eventName}`;
            if (!callbackMap.has(key)) {
                callbackMap.set(key, []);
            }
            const list = callbackMap.get(key);
            list.push(cb);
            return () => {
                const idx = list.indexOf(cb);
                if (idx !== -1)
                    list.splice(idx, 1);
            };
        };
        emitEventImpl = (eventName, payload) => {
            const prefixes = ['agent:', 'workspace:', 'context:', 'system:', 'plugins:', 'voice:'];
            const isPlatformEvent = prefixes.some(p => eventName.startsWith(p));
            if (isPlatformEvent) {
                sendToHost({ type: 'sdk:events:emit', eventName, payload });
            }
            if (directPort) {
                throttledEmitter.emit(eventName, payload, directPort);
            }
            else if (!isPlatformEvent) {
                sendToHost({ type: 'sdk:events:emit', eventName, payload });
            }
        };
        // ── 看门狗心跳（SDK 内置，插件开发者无感）──────────────────────────────
        // 每 5 秒向主进程发送一次，携带内存和 CPU 累计指标
        // 主进程 PluginWatchdog 通过差值计算实际 CPU 使用率
        // 进程池模式（poolRouter 存在）下跳过：由 Host Runner 统一发送一份代表整个池的心跳，
        // 避免 N 个插件各自发送相同的 process.memoryUsage()/cpuUsage() 造成 N 倍冗余。
        if (!poolRouter) {
            const _watchdogHeartbeat = setInterval(() => {
                try {
                    const mem = process.memoryUsage();
                    const cpu = process.cpuUsage();
                    let heapLimit = 512 * 1024 * 1024;
                    try {
                        heapLimit = require('v8').getHeapStatistics().heap_size_limit;
                    }
                    catch { }
                    sendToHost({
                        type: 'sdk:heartbeat',
                        timestamp: Date.now(),
                        metrics: {
                            timestamp: Date.now(),
                            heapUsed: mem.heapUsed,
                            heapTotal: mem.heapTotal,
                            heapLimit,
                            cpuUser: cpu.user, // 累计微秒，需主进程做差值
                            cpuSystem: cpu.system, // 累计微秒
                        },
                    });
                }
                catch (_err) {
                    // 忽略心跳发送失败（进程已关闭时）
                }
            }, 5000);
            // unref 使心跳 timer 不阻止进程正常退出
            if (_watchdogHeartbeat.unref)
                _watchdogHeartbeat.unref();
        }
    }
    else if (isElectronRenderer) {
        let directPort = null;
        const bindRendererDirectPort = (port) => {
            if (directPort) {
                try {
                    directPort.close();
                }
                catch (e) {
                    console.warn(`[Renderer SDK:${pluginId}] Failed to close previous direct port:`, e);
                }
            }
            directPort = port;
            directPort.onmessage = (event) => {
                const msg = event.data;
                if (!msg)
                    return;
                if (msg.type === 'sdk:callback') {
                    const { callbackId, args } = msg;
                    const cb = callbackMap.get(callbackId);
                    if (cb)
                        cb(...args);
                }
                else if (msg.type === 'sdk:events:emit') {
                    const { eventName, payload } = msg;
                    const cbList = callbackMap.get(`evt:${eventName}`);
                    if (cbList) {
                        for (const cb of cbList) {
                            try {
                                cb(payload);
                            }
                            catch (err) {
                                console.error(err);
                            }
                        }
                    }
                }
                else if (msg.type === 'sdk:callApi:stream-chunk') {
                    const { token, chunk } = msg;
                    window.dispatchEvent(new CustomEvent(`plugin:stream-chunk:${token}`, { detail: chunk }));
                }
                else if (msg.type === 'sdk:callApi:stream-end') {
                    const { token, text } = msg;
                    window.dispatchEvent(new CustomEvent(`plugin:stream-end:${token}`, { detail: text }));
                }
                else if (msg.type === 'sdk:callApi:stream-error') {
                    const { token, error } = msg;
                    window.dispatchEvent(new CustomEvent(`plugin:stream-error:${token}`, { detail: error }));
                }
            };
            console.log(`[Renderer SDK:${pluginId}] Direct MessagePort connected.`);
        };
        // 监听 window message 接收来自主进程传递过来的对端 Port1
        const windowMessageHandler = (event) => {
            const msg = event.data;
            if (msg && msg.type === 'plugin:connect-port' && msg.pluginId === pluginId) {
                const port = event.ports && event.ports[0];
                if (port) {
                    bindRendererDirectPort(port);
                }
            }
        };
        window.addEventListener('message', windowMessageHandler);
        postMessageImpl = (msg) => {
            if (directPort) {
                directPort.postMessage(msg);
            }
            else {
                window.electronAPI.ipc.send(`plugin:post-message:${pluginId}`, msg);
            }
        };
        callApiImpl = (apiName, methodName, args) => {
            return window.electronAPI.callApi(apiName, methodName, processArgs(args), pluginId);
        };
        let resultTokenCounter = 1;
        const pendingResults = new Map();
        const resultCallbackId = `sdk:callApiResult:${pluginId || 'generic'}`;
        // 监听来自 preload 的 callApiResult 响应
        window.electronAPI.ipc.on(resultCallbackId, (data) => {
            const { token, success, result, error } = data;
            const pending = pendingResults.get(token);
            if (pending) {
                clearTimeout(pending.timer);
                pendingResults.delete(token);
                if (success)
                    pending.resolve(result);
                else
                    pending.reject(new Error(error || 'callApiResult failed'));
            }
        });
        callApiResultImpl = (apiName, methodName, args, timeoutMs = 30000) => {
            return new Promise((resolve, reject) => {
                const token = resultTokenCounter++;
                const timer = setTimeout(() => {
                    pendingResults.delete(token);
                    reject(new Error(`callApiResult timeout: ${apiName}.${methodName}`));
                }, timeoutMs);
                pendingResults.set(token, { resolve, reject, timer });
                // 通过 preload 的 callApiResult 发送请求（使用 send 而非 invoke）
                window.electronAPI.callApiResult(apiName, methodName, processArgs(args || []), pluginId, token, resultCallbackId);
            });
        };
        if (pluginId) {
            window.electronAPI.ipc.on(`plugin:callback:${pluginId}`, (data) => {
                const { callbackId, args } = data;
                const cb = callbackMap.get(callbackId);
                if (cb)
                    cb(...args);
            });
            window.electronAPI.ipc.on('commands:execute', async (data) => {
                const { commandId, args } = data || {};
                const handler = commandHandlers.get(commandId);
                if (handler) {
                    try {
                        await handler(args);
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            });
        }
        onEventImpl = (eventName, cb) => {
            const domHandler = (e) => {
                const detail = e.detail;
                cb(...(Array.isArray(detail) ? detail : [detail]));
            };
            window.addEventListener(`sdk:event:${eventName}`, domHandler);
            const ipcOff = window.electronAPI.ipc.on(eventName, cb);
            let ipcPluginOff = null;
            if (!eventName.startsWith('plugin:event:')) {
                ipcPluginOff = window.electronAPI.ipc.on(`plugin:event:${eventName}`, cb);
            }
            // 注册到本地 callbackMap 供直连 MessagePort 事件分发
            const key = `evt:${eventName}`;
            if (!callbackMap.has(key)) {
                callbackMap.set(key, []);
            }
            const list = callbackMap.get(key);
            list.push(cb);
            return () => {
                window.removeEventListener(`sdk:event:${eventName}`, domHandler);
                if (typeof ipcOff === 'function')
                    ipcOff();
                if (ipcPluginOff)
                    ipcPluginOff();
                const idx = list.indexOf(cb);
                if (idx !== -1)
                    list.splice(idx, 1);
            };
        };
        emitEventImpl = (eventName, payload) => {
            window.dispatchEvent(new CustomEvent(`sdk:event:${eventName}`, { detail: [payload] }));
            window.electronAPI.ipc.send(eventName, payload);
            if (pluginId && pluginId !== 'system') {
                window.electronAPI.ipc.send(`plugin:emit:${pluginId}`, eventName, payload);
            }
        };
    }
    else if (isIframeRenderer) {
        const pendingCalls = new Map();
        let tokenCounter = 1;
        window.addEventListener('message', (e) => {
            const msg = e.data;
            if (!msg || msg.source !== 'berrytrace-host')
                return;
            if (msg.type === 'api:response') {
                const { callbackId, success, result, error } = msg;
                const pending = pendingCalls.get(callbackId);
                if (pending) {
                    if (success)
                        pending.resolve(result);
                    else
                        pending.reject(new Error(error || 'callApi failed'));
                    pendingCalls.delete(callbackId);
                }
            }
            else if (msg.type === 'api:callback') {
                const { callbackId, args } = msg;
                const cb = callbackMap.get(callbackId);
                if (cb)
                    cb(...args);
            }
            else if (msg.type === 'event') {
                const { eventName, payload } = msg;
                const key = `evt:${eventName}`;
                const cbList = callbackMap.get(key);
                if (cbList) {
                    for (const cb of cbList) {
                        try {
                            cb(payload);
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                }
            }
        });
        callApiImpl = (apiName, methodName, args) => {
            return new Promise((resolve, reject) => {
                const callbackId = tokenCounter++;
                pendingCalls.set(callbackId, { resolve, reject });
                window.parent.postMessage({ source: 'berrytrace-plugin-sdk', type: 'api:call', apiName, methodName, args: processArgs(args), callbackId }, '*');
                setTimeout(() => {
                    if (pendingCalls.has(callbackId)) {
                        pendingCalls.delete(callbackId);
                        reject(new Error(`Timeout: ${apiName}.${methodName}`));
                    }
                }, 30000);
            });
        };
        callApiResultImpl = (apiName, methodName, args, _timeoutMs) => callApiImpl(apiName, methodName, args);
        onEventImpl = (eventName, cb) => {
            const key = `evt:${eventName}`;
            if (!callbackMap.has(key)) {
                callbackMap.set(key, []);
            }
            const list = callbackMap.get(key);
            list.push(cb);
            return () => {
                const idx = list.indexOf(cb);
                if (idx !== -1)
                    list.splice(idx, 1);
            };
        };
        emitEventImpl = (eventName, payload) => {
            window.parent.postMessage({ source: 'berrytrace-plugin-sdk', type: 'event:emit', eventName, payload }, '*');
        };
    }
    else {
        callApiImpl = () => Promise.reject(new Error('Unknown runtime environment'));
        callApiResultImpl = () => Promise.reject(new Error('Unknown runtime environment'));
        onEventImpl = () => () => { };
        emitEventImpl = () => { };
    }
    const callApi = callApiImpl;
    const callApiResult = callApiResultImpl;
    function createApiProxy(apiName, manualMethods = {}) {
        return new Proxy(manualMethods, {
            get(target, prop) {
                if (typeof prop === 'string') {
                    if (prop in target) {
                        return target[prop];
                    }
                    return (...args) => callApi(apiName, prop, args);
                }
                return Reflect.get(target, prop);
            }
        });
    }
    return {
        callApi,
        callApiResult,
        postMessage: (msg) => postMessageImpl(msg),
        log: createApiProxy('log', {
            info: (msg) => callApi('log', 'info', [msg]).catch((err) => { console.log(`[Plugin:${pluginId}:info]`, msg); }),
            warn: (msg) => callApi('log', 'warn', [msg]).catch((err) => { console.warn(`[Plugin:${pluginId}:warn]`, msg); }),
            error: (msg) => callApi('log', 'error', [msg]).catch((err) => { console.error(`[Plugin:${pluginId}:error]`, msg); }),
            debug: (msg) => callApi('log', 'debug', [msg]).catch((err) => { console.debug(`[Plugin:${pluginId}:debug]`, msg); }),
        }),
        plugin: createApiProxy('plugin', {
            getInfo: () => callApi('plugin', 'getInfo'),
            getLifecycleContext: () => callApi('plugin', 'getLifecycleContext')
        }),
        /**
         * 插件生命周期 API
         * requestUnload() — 插件自检后主动请求从进程池卸载，释放内存。
         * 适用于：启动时加载 → 检查状态 → 发现无需运行 → 主动退出。
         * 池化插件调用此方法后，Host 会执行 deactivate() 并从池中移除。
         */
        lifecycle: {
            requestUnload: () => {
                sendToHost({ type: 'pool:request-unload', pluginId });
                return Promise.resolve();
            },
            setBusy: (busy, reason) => {
                sendToHost({ type: 'plugin:lifecycle:set-busy', busy, reason });
                return Promise.resolve();
            },
        },
        ai: createApiProxy('ai', {
            chat: (options) => callApi('ai', 'chat', [options]),
            chatStream: (options, onChunk) => callApi('ai', 'chatStream', [options, onChunk]),
            runAgentTask: (options) => callApi('ai', 'runAgentTask', [options]),
            cancelAgentTask: (sessionId) => callApi('ai', 'cancelAgentTask', [sessionId]),
            getAgentKernelStatus: () => callApi('ai', 'getAgentKernelStatus'),
        }),
        context: createApiProxy('context', {
            getActiveApp: () => callApi('context', 'getActiveApp'),
            getSelection: () => callApi('context', 'getSelection'),
            onActiveAppChanged: (cb) => onEventImpl('context:active-app-changed', cb),
        }),
        mcp: createApiProxy('mcp', {
            registerToolHandler: (toolName, handler) => {
                const win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : global);
                win._mcpHandlers = win._mcpHandlers || new Map();
                const finalName = getFinalToolName(toolName, pluginId || '', options?.toolPrefixes);
                win._mcpHandlers.set(`${pluginId}:${finalName}`, handler);
            },
            registerResourceHandler: (uriPattern, handler) => {
                console.log('registerResourceHandler', uriPattern, handler);
            },
            registerDynamicTool: async (toolSpec, handler) => {
                const win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : global);
                win._mcpHandlers = win._mcpHandlers || new Map();
                const finalName = getFinalToolName(toolSpec.name, pluginId || '', options?.toolPrefixes);
                win._mcpHandlers.set(`${pluginId}:${finalName}`, handler);
                const finalSpec = { ...toolSpec, name: finalName };
                await callApi('mcp', 'registerDynamicTool', [pluginId, finalSpec]);
            },
            registerSystemPrompt: async (promptId, promptText) => {
                await callApi('mcp', 'registerSystemPrompt', [pluginId, { promptId, promptText }]);
            },
            unregisterSystemPrompt: async (promptId) => {
                await callApi('mcp', 'unregisterSystemPrompt', [pluginId, promptId]);
            },
            unregisterDynamicTool: async (toolName) => {
                const win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : global);
                const finalName = getFinalToolName(toolName, pluginId || '', options?.toolPrefixes);
                if (win._mcpHandlers) {
                    win._mcpHandlers.delete(`${pluginId}:${finalName}`);
                }
                await callApi('mcp', 'unregisterDynamicTool', [pluginId, finalName]);
            },
            listTools: () => callApi('mcp', 'listTools'),
            callTool: (name, args) => callApi('mcp', 'callTool', [name, args]),
        }),
        commands: {
            register: (options) => {
                const id = options?.id;
                const handler = options?.handler;
                if (id && typeof handler === 'function') {
                    commandHandlers.set(id, handler);
                }
                const cleanOptions = { ...options };
                delete cleanOptions.handler;
                return callApi('commands', 'register', [cleanOptions]);
            },
            unregister: (id) => {
                commandHandlers.delete(id);
                return callApi('commands', 'unregister', [id]);
            },
            execute: (id, args) => callApi('commands', 'execute', [id, args])
        },
        events: {
            on: (event, callback) => onEventImpl(event, callback),
            once: (event, callback) => {
                const off = onEventImpl(event, (...args) => {
                    off();
                    callback(...args);
                });
            },
            off: (event, callback) => {
                // Covered by the returned off function
            },
            emit: (event, ...args) => emitEventImpl(event, args[0]),
        },
        /**
         * 宿主命令 API 实现
         * 底层复用 onEventImpl，与 events.on 路由通道相同。
         * 语义上区分"命令（宿主→插件）"和"广播通知（任意插件间）"。
         */
        host: {
            onCommand: (commandName, handler) => onEventImpl(commandName, handler),
            onceCommand: (commandName, handler) => {
                const off = onEventImpl(commandName, (...args) => {
                    off();
                    handler(...args);
                });
            },
        },
        window: createApiProxy('window', {
            close: (id) => callApi('window', 'close', id ? [id] : []),
            minimize: () => callApi('window', 'minimize'),
            maximize: () => callApi('window', 'maximize'),
            startDrag: () => callApi('window', 'startDrag'),
            move: (dx, dy) => callApi('window', 'move', [dx, dy]),
            disableDefaultDrag: (disabled) => callApi('window', 'disableDefaultDrag', [disabled]),
            setIgnoreMouseEvents: (ignore, options) => callApi('window', 'setIgnoreMouseEvents', [ignore, options]),
            create: (options) => callApi('window', 'create', [options]),
            show: (id) => callApi('window', 'show', [id]),
            hide: (id) => callApi('window', 'hide', [id]),
            getState: (id) => callApi('window', 'getState', [id]),
            updateWindowOptions: (id, options) => callApi('window', 'updateWindowOptions', [id, options]),
        }),
        createWindow: createApiProxy('window', {
            close: (id) => callApi('window', 'close', id ? [id] : []),
            minimize: () => callApi('window', 'minimize'),
            maximize: () => callApi('window', 'maximize'),
            startDrag: () => callApi('window', 'startDrag'),
            move: (dx, dy) => callApi('window', 'move', [dx, dy]),
            disableDefaultDrag: (disabled) => callApi('window', 'disableDefaultDrag', [disabled]),
            setIgnoreMouseEvents: (ignore, options) => callApi('window', 'setIgnoreMouseEvents', [ignore, options]),
            create: (options) => callApi('window', 'create', [options]),
            show: (id) => callApi('window', 'show', [id]),
            hide: (id) => callApi('window', 'hide', [id]),
            getState: (id) => callApi('window', 'getState', [id]),
            updateWindowOptions: (id, options) => callApi('window', 'updateWindowOptions', [id, options]),
        }),
        storage: createApiProxy('storage', {
            kv: createApiProxy('storage', {
                get: (key, def) => callApi('storage', 'kv.get', [key, def]),
                set: (key, val) => callApi('storage', 'kv.set', [key, val]),
                delete: (key) => callApi('storage', 'kv.delete', [key]),
                clear: () => callApi('storage', 'kv.clear')
            }),
            db: createApiProxy('storage', {
                execute: (sql, params) => callApi('storage', 'db.execute', [sql, params]),
            })
        }),
        filesystem: createApiProxy('filesystem', {
            readFile: (path, enc) => callApi('filesystem', 'readFile', [path, enc]),
            readDir: (path) => callApi('filesystem', 'readDir', [path]),
            writeFile: (path, content) => callApi('filesystem', 'writeFile', [path, content]),
            renameFile: (oldPath, newPath) => callApi('filesystem', 'renameFile', [oldPath, newPath]),
            deleteFile: (path) => callApi('filesystem', 'deleteFile', [path]),
            getSafePath: (name) => callApi('filesystem', 'getSafePath', [name]),
            showItemInFolder: (path) => callApi('filesystem', 'showItemInFolder', [path]),
            stat: (path) => callApi('filesystem', 'stat', [path]),
            mkdir: (path) => callApi('filesystem', 'mkdir', [path]),
            extractZip: (zipPath, destDir, overwrite) => callApi('filesystem', 'extractZip', [zipPath, destDir, overwrite]),
            copyDir: (src, dst) => callApi('filesystem', 'copyDir', [src, dst]),
            removeDir: (path) => callApi('filesystem', 'removeDir', [path]),
            hashFile: (path, algo) => callApi('filesystem', 'hashFile', [path, algo]),
            downloadFile: (url, destPath) => callApi('filesystem', 'downloadFile', [url, destPath])
        }),
        system: createApiProxy('system', {
            getTheme: () => callApi('system', 'getTheme'),
            getAppInfo: () => callApi('system', 'getAppInfo'),
            showNotification: (options) => callApi('system', 'showNotification', [options]),
            openUrl: (url, options) => callApi('system', 'openUrl', [url, options]),
            openExternal: (url) => callApi('system', 'openExternal', [url]),
            execCommand: (options) => callApi('system', 'execCommand', [options]),
            waitCommand: (options) => callApi('system', 'waitCommand', [options]),
            createDesktopShortcut: (options) => callApi('system', 'createDesktopShortcut', [options]),
            setTrayMenu: (menuTemplate) => callApi('system', 'setTrayMenu', [menuTemplate]),
            registerGlobalShortcut: (accelerator, commandId) => callApi('system', 'registerGlobalShortcut', [accelerator, commandId]),
            unregisterGlobalShortcut: (accelerator) => callApi('system', 'unregisterGlobalShortcut', [accelerator]),
            registerShortcutAction: (options) => callApi('system', 'registerShortcutAction', [options]),
            unregisterShortcutAction: (id) => callApi('system', 'unregisterShortcutAction', [id]),
            listShortcutActions: () => callApi('system', 'listShortcutActions'),
        }),
        scheduler: createApiProxy('scheduler', {
            register: (options) => callApi('scheduler', 'register', [options]),
            unregister: (id) => callApi('scheduler', 'unregister', [id]),
            list: () => callApi('scheduler', 'list'),
        }),
        selectionMenu: createApiProxy('selectionMenu', {
            registerItem: (item) => callApi('selectionMenu', 'registerItem', [item]),
            unregisterItem: (id) => callApi('selectionMenu', 'unregisterItem', [id]),
        }),
        hooks: createApiProxy('hooks', {
            register: (name, handler, priority) => callApi('hooks', 'register', [name, pluginId, priority ?? 0, handler.toString()]),
            unregister: (name) => callApi('hooks', 'unregister', [name, pluginId]),
            call: (name, args, opts) => callApiResult('hooks', 'call', [name, args ?? [], opts?.merge ?? false], opts?.timeoutMs ?? 5000),
        }),
        workspace: createApiProxy('workspace', {
            registerView: (viewType, viewClass) => callApi('workspace', 'registerView', [viewType, viewClass]),
            unregisterView: (viewType) => callApi('workspace', 'unregisterView', [viewType]),
            getPath: () => callApi('workspace', 'getPath'),
            getMetadata: () => callApi('workspace', 'getMetadata'),
            setOutline: (sessionId, outline) => callApi('workspace', 'setOutline', [sessionId, outline]),
            setProperties: (sessionId, properties) => callApi('workspace', 'setProperties', [sessionId, properties]),
            getProperties: (sessionId) => callApi('workspace', 'getProperties', [sessionId]),
            getProperty: (sessionId, key) => callApi('workspace', 'getProperty', [sessionId, key]),
            setProperty: (sessionId, key, value) => callApi('workspace', 'setProperty', [sessionId, key, value]),
            registerPanels: (sessionId, panels) => callApi('workspace', 'registerPanels', [sessionId, panels]),
            getActiveTabId: () => callApi('workspace', 'getActiveTabId'),
            getActiveTabConfig: () => callApi('workspace', 'getActiveTabConfig'),
            registerRibbonIcon: (id, icon, title, onClick, pluginId, onContextMenu) => callApi('workspace', 'registerRibbonIcon', [id, icon, title, onClick, pluginId, onContextMenu]),
            unregisterRibbonIcon: (id) => callApi('workspace', 'unregisterRibbonIcon', [id]),
            registerFolderContextMenuItem: (item) => callApi('workspace', 'registerFolderContextMenuItem', [item]),
            unregisterFolderContextMenuItem: (id) => callApi('workspace', 'unregisterFolderContextMenuItem', [id]),
            registerLink: (id, title, url) => callApi('workspace', 'registerLink', [id, title, url]),
            unregisterLink: (id) => callApi('workspace', 'unregisterLink', [id]),
            openWorkspaceTab: (options) => callApi('workspace', 'openWorkspaceTab', [options.filePath, options.pluginId, options.extension, options.articleId, options.sessionId, options.replaceActiveTab, options.title, options.line, options.customParams]),
            splitActiveTab: (direction) => callApi('workspace', 'splitActiveTab', [direction]),
            updateActiveTabInfo: (name, newConfig) => callApi('workspace', 'updateActiveTabInfo', [name, newConfig]),
        }),
        dialog: createApiProxy('dialog', {
            showSaveDialog: (options) => callApi('dialog', 'showSaveDialog', [options]),
            showOpenDialog: (options) => callApi('dialog', 'showOpenDialog', [options]),
        }),
        search: createApiProxy('search', {
            searchNotes: (query, calendarUuid) => callApi('search', 'searchNotes', [query, calendarUuid]),
            searchFiles: (query, workspacePath) => callApi('search', 'searchFiles', [query, workspacePath])
        }),
        localAi: createApiProxy('local-ai'),
        user: createApiProxy('user', {
            setUser: (user) => callApi('user', 'setUser', [user]),
            getUser: () => callApi('user', 'getUser'),
            setLoggedIn: (loggedIn) => callApi('user', 'setLoggedIn', [loggedIn]),
            isLoggedIn: () => callApi('user', 'isLoggedIn'),
            onChange: (cb) => onEventImpl('user:changed', cb),
        }),
        settings: {
            registerTab: (config) => callApi('settings', 'registerTab', [config]),
            unregisterTab: (id) => callApi('settings', 'unregisterTab', [id]),
            getRegisteredTabs: () => callApi('settings', 'getRegisteredTabs'),
        },
    };
}
