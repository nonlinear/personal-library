# Instruções de Python para este projeto

**IMPORTANTE:**

1. Sempre utilize o Python 3.11 do Homebrew:

   - Caminho absoluto: `/opt/homebrew/bin/python3.11`

2. Nunca utilize ambientes virtuais (venv) ou qualquer outro Python do sistema.

3. Para rodar scripts, use SEMPRE:

   ```sh
   /opt/homebrew/bin/python3.11 script.py
   ```

4. Para instalar pacotes, use SEMPRE:

   ```sh
   /opt/homebrew/bin/python3.11 -m pip install pacote
   ```

5. Nunca use `python3`, `python`, `pip`, `pip3` ou comandos sem o caminho completo.

6. Se precisar atualizar dependências, use:
   ```sh
   /opt/homebrew/bin/python3.11 -m pip install --upgrade pacote
   ```

---

**Resumo:**

- Python: `/opt/homebrew/bin/python3.11`
- Sem venv
- Instalação e execução sempre com caminho absoluto
