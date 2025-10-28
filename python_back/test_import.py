#!/usr/bin/env python
# -*- coding: utf-8 -*-
print("Testing imports...")

try:
    from flask import Flask
    print("✓ Flask imported successfully")
except Exception as e:
    print(f"✗ Flask import failed: {e}")

try:
    import pymysql
    print("✓ PyMySQL imported successfully")
except Exception as e:
    print(f"✗ PyMySQL import failed: {e}")

try:
    import jieba
    print("✓ jieba imported successfully")
except Exception as e:
    print(f"✗ jieba import failed: {e}")

try:
    from langchain_community.vectorstores import Chroma
    print("✓ Chroma imported successfully")
except Exception as e:
    print(f"✗ Chroma import failed: {e}")

try:
    from sentence_transformers import SentenceTransformer
    print("✓ SentenceTransformer imported successfully")
except Exception as e:
    print(f"✗ SentenceTransformer import failed: {e}")

print("\nAll imports completed!")
