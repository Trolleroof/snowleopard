import pandas as pd
import sqlite3

# 1. Read the Source CSV file
df = pd.read_csv('inventory.csv')

# 2. Connect to SQLite (creates the file if it doesn't exist)
conn = sqlite3.connect('inventory_converted.db')

# 3. Write the DataFrame to a SQL table
# 'replace' will overwrite the table if it exists
df.to_sql('inventory_table', conn, if_exists='replace', index=False)

conn.close()
print("Conversion complete: inventory_converted.db created.")