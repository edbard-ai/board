import sys
import os
import google.generativeai as genai
import PIL.Image

# Assuming API key is in environment or not needed in this internal environment
try:
    if "GEMINI_API_KEY" in os.environ:
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    
    img = PIL.Image.open("public/question.png")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(["Describe the mechanical drawing in detail. Extract all dimensions and shape features needed to draw the front, top, and side orthographic views. Describe the layout of the shape.", img])
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
