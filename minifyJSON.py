import json

# Replace 'input.json' with the path to your JSON file
input_file = './questions.json'
output_file = 'minified.json'

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',', ':'))
