import pandas as pd
import sqlite3
import pyodbc

db_filename = r'researchdata.mdb'
output_db = 'researchdata.db'

# Kopplingssträng för Windows Access-drivrutin
conn_str = (
    r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
    f'DBQ={db_filename};'
)

try:
    # Anslut till MDB-filen
    mdb_conn = pyodbc.connect(conn_str)
    # Anslut till din nya SQLite-fil
    sqlite_conn = sqlite3.connect(output_db)

    # Hämta lista på alla tabeller i MDB-filen
    cursor = mdb_conn.cursor()
    tables = [t.table_name for t in cursor.tables(tableType='TABLE')]

    for table in tables:
        print(f"Konverterar tabell: {table}...")
        df = pd.read_sql(f'SELECT * FROM [{table}]', mdb_conn)
        df.to_sql(table, sqlite_conn, if_exists='replace', index=False)

    print(f"\nKlar! Din fil sparades som {output_db}")
    mdb_conn.close()
    sqlite_conn.close()

except Exception as e:
    print(f"Ett fel uppstod: {e}")
    print("\nTips: Om du får fel om 'Driver not found', ladda ner 'Microsoft Access Database Engine 2016' från Microsofts hemsida.")
