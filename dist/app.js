"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const service_1 = __importDefault(require("./routes/service"));
const auth_1 = __importDefault(require("./routes/auth"));
const booking_1 = __importDefault(require("./routes/booking"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const swaggerPath = path_1.default.resolve(process.cwd(), "swagger.yaml");
const swaggerDocument = yamljs_1.default.load(swaggerPath);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.use("/api/v1/books", service_1.default);
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/bookings", booking_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📖 Swagger Docs at http://localhost:${PORT}/api-docs`);
});
