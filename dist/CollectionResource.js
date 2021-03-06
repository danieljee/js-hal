"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var urlTemplate = require("url-template");
var Resource_1 = require("./Resource");
var url_1 = require("url");
var CollectionResource = /** @class */ (function (_super) {
    __extends(CollectionResource, _super);
    function CollectionResource(args) {
        var _this = _super.call(this, args.props) || this;
        var props = args.props, uri = args.uri, uriTemplateParams = args.uriTemplateParams;
        var total = props.total, page = props.page, size = props.size;
        uriTemplateParams = uriTemplateParams || {};
        uriTemplateParams['page'] = page;
        uriTemplateParams['size'] = size;
        uri = urlTemplate.parse(uri).expand(uriTemplateParams);
        var parsed = url_1.parse(uri, true);
        var pathname = parsed.pathname;
        parsed.query['page'] = '' + page;
        parsed.query['size'] = '' + size;
        _this.addLink('self', url_1.format({ pathname: pathname, query: parsed.query }));
        if (total > size * (page + 1)) {
            parsed.query['page'] = '' + (page + 1);
            _this.addLink('next', url_1.format({ pathname: pathname, query: parsed.query }));
        }
        if (total > 0 && page > 0) {
            parsed.query['page'] = '' + (page - 1);
            _this.addLink('prev', url_1.format({ pathname: pathname, query: parsed.query }));
        }
        return _this;
    }
    return CollectionResource;
}(Resource_1.default));
exports.default = CollectionResource;
