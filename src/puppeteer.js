"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWebsite = analyzeWebsite;
var puppeteer_core_1 = require("puppeteer-core");
var chromium_1 = require("@sparticuz/chromium");
function analyzeWebsite(url) {
    return __awaiter(this, void 0, void 0, function () {
        var browser, executablePath, page, requests_1, performanceMetrics, coreWebVitals, jsExecutionTime, domContentLoadedTime, unusedJSBytes, totalDomNodes, thirdPartyRequests, resourceBreakdown, longTasks, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 14, 15, 18]);
                    return [4 /*yield*/, chromium_1.default.executablePath()];
                case 1:
                    executablePath = _a.sent();
                    console.log("Puppeteer executablePath:", executablePath);
                    if (!executablePath) {
                        throw new Error("@sparticuz/chromium returned null executablePath");
                    }
                    return [4 /*yield*/, puppeteer_core_1.default.launch({
                            args: __spreadArray(__spreadArray([], chromium_1.default.args, true), [
                                "--disable-gpu",
                                "--no-sandbox",
                                "--disable-setuid-sandbox",
                                "--disable-dev-shm-usage",
                                "--single-process",
                                "--no-zygote",
                            ], false),
                            executablePath: executablePath,
                            headless: true,
                        })];
                case 2:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 3:
                    page = _a.sent();
                    // Block heavy resources
                    return [4 /*yield*/, page.setRequestInterception(true)];
                case 4:
                    // Block heavy resources
                    _a.sent();
                    page.on("request", function (req) {
                        if (["image", "stylesheet", "font", "media"].includes(req.resourceType())) {
                            req.abort();
                        }
                        else {
                            req.continue();
                        }
                    });
                    requests_1 = [];
                    page.on("request", function (req) {
                        if (!req.isInterceptResolutionHandled()) {
                            requests_1.push(req.url());
                        }
                    });
                    return [4 /*yield*/, page.goto(url, { waitUntil: "load", timeout: 15000 })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            var perfData = window.performance;
                            return {
                                navigationTiming: JSON.parse(JSON.stringify(perfData.getEntriesByType("navigation")[0] || {})),
                                resourceTiming: JSON.parse(JSON.stringify(perfData.getEntriesByType("resource").slice(0, 20))),
                                paintTiming: JSON.parse(JSON.stringify(perfData.getEntriesByType("paint"))),
                            };
                        })];
                case 6:
                    performanceMetrics = _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            return new Promise(function (resolve) {
                                var LCP = 0;
                                var CLS = 0;
                                var FID = 0;
                                var lcpObserver = new PerformanceObserver(function (entryList) {
                                    var entries = entryList.getEntries();
                                    var lastEntry = entries[entries.length - 1];
                                    LCP = lastEntry.startTime;
                                });
                                lcpObserver.observe({
                                    type: "largest-contentful-paint",
                                    buffered: true,
                                });
                                var clsObserver = new PerformanceObserver(function (entryList) {
                                    for (var _i = 0, _a = entryList.getEntries(); _i < _a.length; _i++) {
                                        var entry = _a[_i];
                                        CLS += entry.value;
                                    }
                                });
                                clsObserver.observe({ type: "layout-shift", buffered: true });
                                var fidObserver = new PerformanceObserver(function (entryList) {
                                    var entry = entryList.getEntries()[0];
                                    if (entry)
                                        FID = entry.processingStart;
                                });
                                fidObserver.observe({ type: "first-input", buffered: true });
                                setTimeout(function () {
                                    lcpObserver.disconnect();
                                    clsObserver.disconnect();
                                    fidObserver.disconnect();
                                    resolve({ LCP: LCP, CLS: CLS, FID: FID });
                                }, 1000);
                            });
                        })];
                case 7:
                    coreWebVitals = _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            var start = performance.now();
                            new Array(50000).fill(0).map(function (_, i) { return i * 2; });
                            return performance.now() - start;
                        })];
                case 8:
                    jsExecutionTime = _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            var navEntry = performance.getEntriesByType("navigation")[0];
                            return navEntry.domContentLoadedEventEnd - navEntry.startTime;
                        })];
                case 9:
                    domContentLoadedTime = _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            return performance.getEntriesByType("resource")
                                .filter(function (r) { return r.initiatorType === "script"; })
                                .slice(0, 5)
                                .map(function (script) { return ({
                                name: script.name,
                                transferSize: script.transferSize,
                                encodedBodySize: script.encodedBodySize,
                            }); });
                        })];
                case 10:
                    unusedJSBytes = _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            return document.getElementsByTagName("*").length;
                        })];
                case 11:
                    totalDomNodes = _a.sent();
                    thirdPartyRequests = requests_1.filter(function (req) {
                        try {
                            var urlObj = new URL(req);
                            return !urlObj.hostname.includes("yourdomain.com");
                        }
                        catch (_a) {
                            return false;
                        }
                    });
                    return [4 /*yield*/, page.evaluate(function () {
                            var types = {};
                            performance
                                .getEntriesByType("resource")
                                .slice(0, 20)
                                .forEach(function (res) {
                                var type = res.initiatorType;
                                if (["css", "script", "img", "font"].includes(type)) {
                                    types[type] = (types[type] || 0) + 1;
                                }
                            });
                            return types;
                        })];
                case 12:
                    resourceBreakdown = _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            return new Promise(function (resolve) {
                                var entries = [];
                                var observer = new PerformanceObserver(function (list) {
                                    entries.push.apply(entries, list
                                        .getEntries()
                                        .map(function (e) { return ({
                                        name: e.name,
                                        startTime: e.startTime,
                                        duration: e.duration,
                                    }); })
                                        .slice(0, 5));
                                });
                                observer.observe({ entryTypes: ["longtask"] });
                                setTimeout(function () {
                                    observer.disconnect();
                                    resolve(entries);
                                }, 1000);
                            });
                        })];
                case 13:
                    longTasks = _a.sent();
                    return [2 /*return*/, {
                            url: url,
                            performanceMetrics: performanceMetrics,
                            domContentLoadedTime: domContentLoadedTime,
                            coreWebVitals: coreWebVitals,
                            jsExecutionTime: jsExecutionTime,
                            networkRequests: requests_1.slice(0, 20),
                            totalDomNodes: totalDomNodes,
                            thirdPartyRequestsCount: thirdPartyRequests.length,
                            resourceBreakdown: resourceBreakdown,
                            longTasks: longTasks,
                            unusedJSBytes: unusedJSBytes,
                        }];
                case 14:
                    error_1 = _a.sent();
                    console.error("Puppeteer error:", error_1);
                    throw error_1;
                case 15:
                    if (!browser) return [3 /*break*/, 17];
                    return [4 /*yield*/, browser.close()];
                case 16:
                    _a.sent();
                    _a.label = 17;
                case 17: return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        });
    });
}
