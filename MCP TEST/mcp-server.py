import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import datetime
import json

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# 🔥 MEMORIA: Lista para guardar todas las conversaciones
conversaciones = []

# Configurar Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("❌ ERROR: No encontré GEMINI_API_KEY")
    exit(1)

try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
    print("✅ API de Gemini configurada correctamente")
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

def guardar_conversacion(usuario, gemini, modelo):
    """Guarda una conversación en la memoria"""
    conversacion = {
        "id": len(conversaciones) + 1,
        "timestamp": datetime.datetime.now().isoformat(),
        "usuario": usuario,
        "gemini": gemini,
        "modelo": modelo
    }
    conversaciones.append(conversacion)
    return conversacion

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "mensaje": "🚀 Servidor MCP con MEMORIA activo",
        "estado": "funcionando", 
        "modelo": "gemini-1.5-flash",
        "conversaciones_guardadas": len(conversaciones),
        "endpoints": {
            "salud": "/health (GET)",
            "chat": "/chat (POST)",
            "historial": "/historial (GET)",
            "limpiar_memoria": "/limpiar (DELETE)"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "✅ Servidor con memoria activo",
        "timestamp": datetime.datetime.now().isoformat(),
        "modelo": "gemini-1.5-flash",
        "total_conversaciones": len(conversaciones)
    })

@app.route('/chat', methods=['POST'])
def chat_with_gemini():
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "error": "❌ Falta el campo 'message'",
                "ejemplo": {"message": "Hola"}
            }), 400
        
        user_message = data['message']
        custom_prompt = data.get('system_prompt', "")  # 🔥 NUEVO: Recibir prompt personalizado
        
        print(f"📥 MENSAJE RECIBIDO: {user_message}")
        
        # 🔥 OPCIONAL: Usar contexto de conversaciones anteriores
        contexto = ""
        if conversaciones and data.get('usar_contexto', False):
            # Tomar hasta las últimas 20 conversaciones para no exceder tokens
            ultimas = conversaciones[-20:]
            contexto = "\nHistorial reciente de la conversación:\n"
            for i, conv in enumerate(ultimas, 1):
                contexto += f"Interacción {i}:\n"
                contexto += f"Usuario: {conv['usuario']}\n"
                contexto += f"Asistente: {conv['gemini']}\n\n"
        
        # 🔥 MODIFICADO: Incluir prompt personalizado si existe
        mensaje_con_contexto = ""
        if custom_prompt:
            mensaje_con_contexto = custom_prompt + "\n\n"
        
        mensaje_con_contexto += contexto + f"\nMensaje actual del usuario: {user_message}" if contexto else user_message 
        
        print("🔄 Enviando a Gemini...")
        response = model.generate_content(mensaje_con_contexto)
        gemini_response = response.text
        print(f"📤 RESPUESTA: {gemini_response}")
        
        # 🔥 GUARDAR EN MEMORIA
        conversacion_guardada = guardar_conversacion(user_message, gemini_response, "gemini-1.5-flash")
        
        return jsonify({
            "user_message": user_message,
            "gemini_response": gemini_response,
            "status": "success",
            "model": "gemini-1.5-flash",
            "conversacion_id": conversacion_guardada["id"],
            "timestamp": conversacion_guardada["timestamp"],
            "total_conversaciones": len(conversaciones)
        })
        
    except Exception as e:
        error_msg = f"❌ Error: {str(e)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 500

# 🔥 NUEVO: Endpoint para ver el historial completo
@app.route('/historial', methods=['GET'])
def obtener_historial():
    try:
        # Parámetros opcionales para filtrar
        limite = request.args.get('limite', default=10, type=int)
        orden = request.args.get('orden', default='desc')  # asc o desc
        
        historial = conversaciones.copy()
        
        # Ordenar
        if orden == 'asc':
            historial.reverse()
        
        # Limitar
        historial = historial[-limite:] if orden == 'desc' else historial[:limite]
        
        return jsonify({
            "total_conversaciones": len(conversaciones),
            "mostrando": len(historial),
            "orden": orden,
            "conversaciones": historial
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔥 NUEVO: Endpoint para buscar en el historial
@app.route('/historial/buscar', methods=['GET'])
def buscar_historial():
    try:
        termino = request.args.get('q', '')
        if not termino:
            return jsonify({"error": "Falta parámetro 'q' para buscar"}), 400
        
        resultados = []
        for conv in conversaciones:
            if (termino.lower() in conv['usuario'].lower() or 
                termino.lower() in conv['gemini'].lower()):
                resultados.append(conv)
        
        return jsonify({
            "termino_busqueda": termino,
            "resultados_encontrados": len(resultados),
            "resultados": resultados
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔥 NUEVO: Endpoint para limpiar memoria
@app.route('/limpiar', methods=['DELETE'])
def limpiar_memoria():
    try:
        cantidad = len(conversaciones)
        conversaciones.clear()
        
        return jsonify({
            "mensaje": "✅ Memoria limpiada correctamente",
            "conversaciones_eliminadas": cantidad,
            "conversaciones_restantes": len(conversaciones)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔥 NUEVO: Endpoint para estadísticas
@app.route('/estadisticas', methods=['GET'])
def obtener_estadisticas():
    try:
        if not conversaciones:
            return jsonify({"mensaje": "No hay conversaciones aún"})
        
        total_mensajes = len(conversaciones)
        primer_mensaje = conversaciones[0]['timestamp'] if conversaciones else None
        ultimo_mensaje = conversaciones[-1]['timestamp'] if conversaciones else None
        
        # Contar longitud promedio
        total_caracteres_usuario = sum(len(conv['usuario']) for conv in conversaciones)
        total_caracteres_gemini = sum(len(conv['gemini']) for conv in conversaciones)
        
        return jsonify({
            "total_conversaciones": total_mensajes,
            "primera_conversacion": primer_mensaje,
            "ultima_conversacion": ultimo_mensaje,
            "promedio_caracteres_usuario": total_caracteres_usuario // total_mensajes if total_mensajes > 0 else 0,
            "promedio_caracteres_gemini": total_caracteres_gemini // total_mensajes if total_mensajes > 0 else 0,
            "uso_memoria_aproximado": f"{(total_caracteres_usuario + total_caracteres_gemini) / 1024:.2f} KB"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 INICIANDO SERVIDOR MCP CON MEMORIA")
    print("="*60)
    print("📍 URL: http://localhost:5000")
    print("🤖 Modelo: gemini-1.5-flash")
    print("🧠 Memoria: ACTIVADA (se guarda hasta apagar servidor)")
    print("\n📚 Endpoints:")
    print("   GET    /health              - Estado del servidor")
    print("   POST   /chat                - Enviar mensaje")
    print("   GET    /historial           - Ver conversaciones")
    print("   GET    /historial/buscar?q= - Buscar en conversaciones") 
    print("   GET    /estadisticas        - Estadísticas de uso")
    print("   DELETE /limpiar             - Limpiar memoria")
    print("="*60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)