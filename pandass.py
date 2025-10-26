import pandas as pd
from sqlalchemy import create_engine, text

# ---------------------------
# 1️⃣ Configuración de conexión
# ---------------------------
usuario = "postgres"
contraseña = "270704"
host = "localhost"
puerto = "5432"
basedatos = "OpenByBan"

engine = create_engine(f"postgresql+psycopg2://{usuario}:{contraseña}@{host}:{puerto}/{basedatos}")

# ---------------------------
# 2️⃣ Leer CSV (solo primeros 1000 registros)
# ---------------------------
df = pd.read_csv(r"C:\Users\gtjos\OneDrive\Documentos\HACK\finanzas_empresa.csv", encoding='latin1')
df['fecha'] = pd.to_datetime(df['fecha'], format='%m/%d/%Y').dt.strftime('%Y-%m-%d')
df = df.head(5000)  # ✅ Solo tomar primeros 1000 registros

# ---------------------------
# 3️⃣ Insertar datos
# ---------------------------
# Preparar datos para transacciones
transacciones_data = []
with engine.connect() as conn:
    for i, row in df.iterrows():
        # ✅ Mostrar progreso cada 100 registros
        if i % 100 == 0:
            print(f"Procesando registro {i+1}/1000...")
            
        if (pd.notna(row['empresa_id']) and pd.notna(row['monto']) and 
            pd.notna(row['concepto']) and pd.notna(row['categoria']) and
            pd.notna(row['tipo'])):
            
            # Mapear tipo: 1 para ingreso, 2 para gasto
            tipo_id = 1 if row['tipo'].strip().lower() == 'ingreso' else 2
            
            # Insertar concepto si no existe y obtener su ID
            concepto_id = conn.execute(
                text("""
                    INSERT INTO concepto (descripcion) 
                    VALUES (:desc) 
                    ON CONFLICT (descripcion) DO UPDATE SET descripcion = EXCLUDED.descripcion
                    RETURNING idconcepto
                """),
                {"desc": row['concepto']}
            ).scalar()
            
            # Insertar categoría si no existe y obtener su ID
            categoria_id = conn.execute(
                text("""
                    INSERT INTO categorias (descripcion) 
                    VALUES (:desc) 
                    ON CONFLICT (descripcion) DO UPDATE SET descripcion = EXCLUDED.descripcion
                    RETURNING idcategorias
                """),
                {"desc": row['categoria']}
            ).scalar()
            
            # Verificar que existe la empresa
            empresa_existe = conn.execute(
                text("SELECT 1 FROM empresa WHERE idempresa = :empresa_id"),
                {"empresa_id": row['empresa_id'].strip()}
            ).scalar()
            
            # Si la empresa existe, preparar datos para inserción
            if empresa_existe:
                transacciones_data.append({
                    "tipo_id": tipo_id,
                    "concepto_id": concepto_id,
                    "categoria_id": categoria_id,
                    "empresa_id": row['empresa_id'].strip(),
                    "monto": float(row['monto']),  # Convertir a float por si acaso
                    "fecha": row['fecha']
                })

# Insertar todas las transacciones de una vez
if transacciones_data:
    with engine.connect() as conn:
        conn.execute(
            text("""
                INSERT INTO transaccion 
                (idtipo, concepto_idconcepto, categorias_idcategorias, idempresa, monto, fecha) 
                VALUES (:tipo_id, :concepto_id, :categoria_id, :empresa_id, :monto, :fecha)
            """),
            transacciones_data
        )
        conn.commit()
        print(f"✅ Se insertaron {len(transacciones_data)} transacciones de 1000 registros procesados")
else:
    print("❌ No hay datos válidos para insertar")

print("✅ Proceso completado. Datos insertados correctamente en todas las tablas.")