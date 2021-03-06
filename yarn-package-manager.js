"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const base_package_manager_1 = require("./base-package-manager");
const decorators_1 = require("./common/decorators");
class YarnPackageManager extends base_package_manager_1.BasePackageManager {
    constructor($childProcess, $errors, $fs, $hostInfo, $httpClient, $logger, $pacoteService) {
        super($childProcess, $fs, $hostInfo, $pacoteService, 'yarn');
        this.$errors = $errors;
        this.$httpClient = $httpClient;
        this.$logger = $logger;
    }
    install(packageName, pathToSave, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config.disableNpmInstall) {
                return;
            }
            if (config.ignoreScripts) {
                config['ignore-scripts'] = true;
            }
            const packageJsonPath = path.join(pathToSave, 'package.json');
            const jsonContentBefore = this.$fs.readJson(packageJsonPath);
            const flags = this.getFlagsString(config, true);
            let params = [];
            const isInstallingAllDependencies = packageName === pathToSave;
            if (!isInstallingAllDependencies) {
                params.push('add', packageName);
            }
            params = params.concat(flags);
            const cwd = pathToSave;
            try {
                const result = yield this.processPackageManagerInstall(packageName, params, { cwd, isInstallingAllDependencies });
                return result;
            }
            catch (e) {
                this.$fs.writeJson(packageJsonPath, jsonContentBefore);
                throw e;
            }
        });
    }
    uninstall(packageName, config, path) {
        const flags = this.getFlagsString(config, false);
        return this.$childProcess.exec(`yarn remove ${packageName} ${flags}`, { cwd: path });
    }
    view(packageName, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const wrappedConfig = _.extend({}, config, { json: true });
            const flags = this.getFlagsString(wrappedConfig, false);
            let viewResult;
            try {
                viewResult = yield this.$childProcess.exec(`yarn info ${packageName} ${flags}`);
            }
            catch (e) {
                this.$errors.failWithoutHelp(e.message);
            }
            const result = JSON.parse(viewResult);
            return result.data;
        });
    }
    search(filter, config) {
        this.$errors.fail("Method not implemented. Yarn does not support searching for packages in the registry.");
        return null;
    }
    searchNpms(keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            const httpRequestResult = yield this.$httpClient.httpRequest(`https://api.npms.io/v2/search?q=keywords:${keyword}`);
            const result = JSON.parse(httpRequestResult.body);
            return result;
        });
    }
    getRegistryPackageData(packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            const registry = yield this.$childProcess.exec(`yarn config get registry`);
            const url = `${registry.trim()}/${packageName}`;
            this.$logger.trace(`Trying to get data from yarn registry for package ${packageName}, url is: ${url}`);
            const responseData = (yield this.$httpClient.httpRequest(url)).body;
            this.$logger.trace(`Successfully received data from yarn registry for package ${packageName}. Response data is: ${responseData}`);
            const jsonData = JSON.parse(responseData);
            this.$logger.trace(`Successfully parsed data from yarn registry for package ${packageName}.`);
            return jsonData;
        });
    }
    getCachePath() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.$childProcess.exec(`yarn cache dir`);
            return result.toString().trim();
        });
    }
}
__decorate([
    decorators_1.exported("yarn")
], YarnPackageManager.prototype, "install", null);
__decorate([
    decorators_1.exported("yarn")
], YarnPackageManager.prototype, "uninstall", null);
__decorate([
    decorators_1.exported("yarn")
], YarnPackageManager.prototype, "view", null);
__decorate([
    decorators_1.exported("yarn")
], YarnPackageManager.prototype, "search", null);
__decorate([
    decorators_1.exported("yarn")
], YarnPackageManager.prototype, "getRegistryPackageData", null);
__decorate([
    decorators_1.exported("yarn")
], YarnPackageManager.prototype, "getCachePath", null);
exports.YarnPackageManager = YarnPackageManager;
$injector.register("yarn", YarnPackageManager);
