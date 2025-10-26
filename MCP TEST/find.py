import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

print("🔍 BUSCANDO MODELOS DISPONIBLES...")
print("=" * 60)

modelos_generacion = []
modelos_embedding = []

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        modelos_generacion.append(model)
    elif 'embedContent' in model.supported_generation_methods:
        modelos_embedding.append(model)

print("🚀 MODELOS PARA GENERACIÓN DE CONTENIDO:")
print("-" * 40)
for model in modelos_generacion:
    print(f"✅ {model.name}")
    print(f"   📝 {model.description}")
    print(f"   🛠️  Métodos: {model.supported_generation_methods}")
    print()

print("🔤 MODELOS PARA EMBEDDINGS:")
print("-" * 40)
for model in modelos_embedding:
    print(f"📊 {model.name}")
    print(f"   📝 {model.description}")
    print()

# Recomendar el mejor modelo
if modelos_generacion:
    print("🎯 RECOMENDACIÓN:")
    # Priorizar modelos más recientes
    modelos_prioridad = []
    
    for model in modelos_generacion:
        nombre = model.name.lower()
        if 'flash' in nombre and 'latest' in nombre:
            modelos_prioridad.insert(0, model)  # Máxima prioridad
        elif 'flash' in nombre:
            modelos_prioridad.append(model)
        elif 'pro' in nombre and 'latest' in nombre:
            modelos_prioridad.append(model)
        elif 'pro' in nombre:
            modelos_prioridad.append(model)
        else:
            modelos_prioridad.append(model)
    
    if modelos_prioridad:
        mejor_modelo = modelos_prioridad[0]
        print(f"   🤖 USAR: {mejor_modelo.name}")
        print(f"   📖 Descripción: {mejor_modelo.description}")