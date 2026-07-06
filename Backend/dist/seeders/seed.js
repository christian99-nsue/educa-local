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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const win32_1 = __importDefault(require("path/win32"));
dotenv_1.default.config({ path: win32_1.default.resolve("../.env") });
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🚀 Iniciando seeder...");
        // 🔥 LIMPIAR TABLAS (opcional pero recomendado en pruebas)
        yield db_1.db.query("SET FOREIGN_KEY_CHECKS = 0");
        yield db_1.db.query("TRUNCATE TABLE centro_usuarios");
        yield db_1.db.query("TRUNCATE TABLE usuarios");
        yield db_1.db.query("TRUNCATE TABLE centros");
        yield db_1.db.query("SET FOREIGN_KEY_CHECKS = 1");
        console.log("🧹 Tablas limpiadas");
        // 🏫 CREAR CENTROS
        const [centros] = yield db_1.db.query("INSERT INTO centros (nombre) VALUES ?", [
            [
                ["Colegio Privado Buen Pastor"],
                ["Colegio Claret"],
                ["Colegio Adventista"],
                ["Colegio Ewaiso Ipola"],
                ["Colegio Emanuel"],
            ],
        ]);
        console.log("🏫 Centros creados");
        // 👤 CREAR USUARIOS
        const passwordHash = yield bcrypt_1.default.hash("123456", 10);
        const [usuarios] = yield db_1.db.query("INSERT INTO usuarios (email, password, nombre, apellidos, code) VALUES ?", [
            [
                [
                    "deograciasondonsuenzang@gmail.com",
                    passwordHash,
                    "Deogracias Ondo",
                    "Nsue Nzang",
                    "A001",
                ],
                [
                    "benjamin.nsue@gmail.com",
                    passwordHash,
                    "Benjamin Nsue",
                    "Nsue Nzang",
                    "M001",
                ],
                [
                    "eliseo.obama@gmail.com",
                    passwordHash,
                    "Eliseo Obama",
                    "Nsue Nzang",
                    "S001",
                ],
                [
                    "christiannsue00@gmail.com",
                    passwordHash,
                    "Christian",
                    "Nsue",
                    "C001",
                ],
                ["manuelmbela@gmail.com", passwordHash, "Manuel", "Mbela", "B001"],
                [
                    "gabrielnguema@gmail.com",
                    passwordHash,
                    "Gabriel",
                    "Nguema",
                    "Z001",
                ],
                ["pilarndong12@gmail.com", passwordHash, "Pilar", "Ndong", "P001"],
                [
                    "catherineboñao@gmail.com",
                    passwordHash,
                    "Catherine",
                    "Boñao",
                    "C002",
                ],
                ["hilicristiano@gmail.com", passwordHash, "Hilario", "Ndong", "H001"],
                ["josenguema@gmail.com", passwordHash, "Jose", "Nguema", "J001"],
            ],
        ]);
        console.log("👤 Usuarios creados");
        // 🔗 CREAR RELACIONES (centro_usuarios)
        yield db_1.db.query("INSERT INTO centro_usuarios (user_id, centro_id, rol_en_centro) VALUES ?", [
            [
                [1, 1, "profesor"],
                [2, 1, "alumno"],
                [3, 2, "alumno"],
                [4, 3, "profesor"],
                [4, 5, "profesor"],
                [4, 1, "profesor"],
                [1, 2, "profesor"],
                [1, 3, "profesor"],
                [1, 4, "profesor"],
                [4, 2, "profesor"],
                [5, 1, "profesor"],
                [6, 3, "alumno"],
                [7, 4, "admin"],
                [7, 2, "admin"],
                [8, 5, "alumno"],
                [8, 1, "profesor"],
                [9, 5, "alumno"],
                [10, 3, "alumno"],
            ],
        ]);
        console.log("🔗 Relaciones creadas");
        console.log("✅ SEED COMPLETADO CON ÉXITO");
        process.exit();
    }
    catch (error) {
        console.error("❌ Error en seed:", error);
        process.exit(1);
    }
});
seed();
