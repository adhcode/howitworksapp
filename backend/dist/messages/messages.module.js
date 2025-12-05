"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MessagesModule", {
    enumerable: true,
    get: function() {
        return MessagesModule;
    }
});
const _common = require("@nestjs/common");
const _messagesservice = require("./messages.service");
const _enhancedmessagesservice = require("./enhanced-messages.service");
const _messagescontroller = require("./messages.controller");
const _maintenancecontroller = require("./maintenance.controller");
const _databasemodule = require("../database/database.module");
const _notificationsmodule = require("../core/notifications/notifications.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let MessagesModule = class MessagesModule {
};
MessagesModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _databasemodule.DatabaseModule,
            _notificationsmodule.NotificationsModule
        ],
        controllers: [
            _messagescontroller.MessagesController,
            _maintenancecontroller.MaintenanceController
        ],
        providers: [
            _messagesservice.MessagesService,
            _enhancedmessagesservice.EnhancedMessagesService
        ],
        exports: [
            _messagesservice.MessagesService,
            _enhancedmessagesservice.EnhancedMessagesService
        ]
    })
], MessagesModule);

//# sourceMappingURL=messages.module.js.map