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
exports.registrarCentro = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../config/db");
//COnvierte cualquier fecha Iso a "YYYY_MM_DD"
function formatearFechaSQL(fechaISO) {
    return fechaISO.split("T")[0];
}
//Genera codigo del centro
function generarCodigoCentro() {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letraAleatoria = letras[Math.floor(Math.random() * letras.length)];
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    return `${letraAleatoria}${numeroAleatorio}`;
}
function generarCodigoCentroUnico(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        let codigo;
        let existe = true;
        do {
            codigo = generarCodigoCentro();
            const [rows] = yield connection.query(`SELECT id FROM usuarios WHERE code = ? LIMIT 1`, [codigo]);
            existe = rows.length > 0;
        } while (existe);
        return codigo;
    });
}
//COdigo de usuario (alumno/profesor/admin)
function generarInicialesCentro(nombreCentro, maxLetras = 3) {
    const palabras = nombreCentro
        .trim()
        .split(/\s+/)
        .filter((p) => p.length > 2);
    const iniciales = palabras
        .map((p) => p[0].toUpperCase())
        .slice(0, maxLetras)
        .join("");
    return iniciales || "CTR";
}
function generarCodigoUsuario(inicilaesCentro) {
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    return `${inicilaesCentro}${numeroAleatorio}`;
}
function generarCodigoUsuarioUnico(connection, inicialesCentro) {
    return __awaiter(this, void 0, void 0, function* () {
        let codigo;
        let existe = true;
        do {
            codigo = generarCodigoUsuario(inicialesCentro);
            const [rows] = yield connection.query(`SELECT id FROM usuarios WHERE code = ? LIMIT 1`, [codigo]);
            existe = rows.length > 0;
        } while (existe);
        return codigo;
    });
}
const registrarCentro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { centro, admin, estructura, configuracion } = req.body;
    const connection = yield db_1.db.getConnection();
    try {
        yield connection.beginTransaction();
        //1. Generar codigo unico del centro y Crear el centro
        const codigoCentro = yield generarCodigoCentroUnico(connection);
        const [centroResult] = yield connection.query(`INSERT INTO centros (codigo, nombre, tipo_de_centro, pais, ciudad, direccion, telefono, email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            codigoCentro,
            centro.nombre_del_centro,
            centro.tipo_de_centro,
            centro.pais,
            centro.ciudad,
            centro.direccion,
            centro.telefono,
            centro.email,
        ]);
        const centroId = centroResult.insertId;
        //2. Crear el usuario administrador
        const inicialesCentro = generarInicialesCentro(centro.nombre_del_centro);
        const codigoUsuario = yield generarCodigoUsuarioUnico(connection, inicialesCentro);
        const hashedPassword = yield bcrypt_1.default.hash(admin.password, 10);
        const [usuarioResult] = yield connection.query(`INSERT INTO usuarios (code, nombre, apellidos, email, telefono, password)
            VALUES (?, ?, ?, ?, ?, ?)`, [
            codigoUsuario,
            admin.nombre,
            admin.apellidos,
            admin.correo,
            admin.telefono,
            hashedPassword,
        ]);
        const usuarioId = usuarioResult.insertId;
        //3. Vincular usuario-centro con rol admin
        yield connection.query(`INSERT INTO centro_usuarios (centro_id, user_id, rol_en_centro)
            VALUES (?, ?, 'admin')`, [centroId, usuarioId]);
        //4. Guardar configuracion del centro
        yield connection.query(`INSERT INTO centro_configuracion (centro_id, ano_academico, idioma_sistema, zona_horaria, sistema_calificacion, inicio_ano_academico)
            VALUES (?, ?, ?, ?, ?, ?)`, [
            centroId,
            configuracion.anoAcademico,
            configuracion.idiomaSistema,
            configuracion.zonaHoraria,
            configuracion.sistemaCalificacion,
            formatearFechaSQL(configuracion.inicioAnoAcademico),
        ]);
        //5. Guardar niveles y cursos
        for (const [nivel, activo] of Object.entries(estructura.niveles)) {
            if (!activo)
                continue;
            const cursosDelNivel = (_a = estructura.cursos[nivel]) !== null && _a !== void 0 ? _a : [];
            for (const curso of cursosDelNivel) {
                yield connection.query(`INSERT INTO centro_cursos (centro_id, nivel, curso) VALUES (?, ?, ?)`, [centroId, nivel, curso]);
            }
        }
        yield connection.commit();
        res.status(201).json({ centroId, usuarioId, codigoCentro, codigoUsuario });
    }
    catch (error) {
        yield connection.rollback();
        console.error("Error al registrar el centro:", error);
        res.status(500).json({ error: "No se pudo completar el registro" });
    }
    finally {
        connection.release();
    }
});
exports.registrarCentro = registrarCentro;
