"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ApiPaginatedResponse", {
    enumerable: true,
    get: function() {
        return ApiPaginatedResponse;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const ApiPaginatedResponse = (model)=>{
    return (0, _common.applyDecorators)((0, _swagger.ApiOkResponse)({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: (0, _swagger.getSchemaPath)(model)
                            }
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                total: {
                                    type: 'number'
                                },
                                page: {
                                    type: 'number'
                                },
                                limit: {
                                    type: 'number'
                                },
                                totalPages: {
                                    type: 'number'
                                },
                                hasNextPage: {
                                    type: 'boolean'
                                },
                                hasPrevPage: {
                                    type: 'boolean'
                                }
                            }
                        }
                    }
                }
            ]
        }
    }));
};

//# sourceMappingURL=api-paginated-response.decorator.js.map