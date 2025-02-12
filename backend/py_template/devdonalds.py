from dataclasses import dataclass
from typing import List, Dict, Union
from flask import Flask, request, jsonify
import re

# ==== Type Definitions, feel free to add or modify ===========================
@dataclass
class CookbookEntry:
    name: str

@dataclass
class RequiredItem():
    name: str
    quantity: int

@dataclass
class Recipe(CookbookEntry):
    required_items: List[RequiredItem]

@dataclass
class Ingredient(CookbookEntry):
    cook_time: int


# =============================================================================
# ==== HTTP Endpoint Stubs ====================================================
# =============================================================================
app = Flask(__name__)

# Store your recipes here!
cookbook = {}

# Task 1 helper (don't touch)
@app.route("/parse", methods=['POST'])
def parse():
    data = request.get_json()
    recipe_name = data.get('input', '')
    parsed_name = parse_handwriting(recipe_name)
    if parsed_name is None:
        return 'Invalid recipe name', 400
    return jsonify({'msg': parsed_name}), 200

# [TASK 1] ====================================================================
# Takes in a recipeName and returns it in a form that 
def parse_handwriting(recipeName: str) -> Union[str | None]:
    # 0. No alphabetical characters should be considered invalid
    if not re.search(r'[a-zA-Z]', recipeName):
        return None

    # 1. Replace - & _ with whitespace
    recipeName = recipeName.replace('-', ' ')
    recipeName = recipeName.replace('_', ' ')

    # 2. Non-alphabetic characters removed
    recipeName = re.sub(r'[^a-zA-Z ]', '', recipeName)
 
    # 3. Make all lowercase
    recipeName = recipeName.lower()

    # 4. Multiple whitespaces should be truncated to one
    recipeName = re.sub(r'\s+', ' ', recipeName)

    # 5. First character capitalised
    recipeName = recipeName.title()

    return recipeName

# [TASK 2] ====================================================================
# Endpoint that adds a CookbookEntry to your magical cookbook
@app.route('/entry', methods=['POST'])
def create_entry():
    """Adds a new recipe or ingredient to the cookbook."""
    data = request.get_json()

    if 'name' not in data or 'type' not in data:
        return jsonify({'msg': 'error found'}), 400

    # Maybe data['name'] can be invalid
    entry_name = parse_handwriting(data['name'])
    if entry_name is None:
        return jsonify({'msg': 'error found'}), 400

    # Check for duplicate entry name
    if entry_name in cookbook:
        return jsonify({'msg': 'error found'}), 400

    entry_type = data['type']
    if entry_type == 'recipe':
        if 'requiredItems' not in data or not isinstance(data['requiredItems'], list):
            return jsonify({'msg': 'error found'}), 400

        success, recipe_obj = parse_recipe(entry_name, data['requiredItems'])
        if success:
            cookbook[entry_name] = recipe_obj
            
            print(cookbook)
            return {}, 200
        return jsonify({'msg': 'error found'}), 400

    elif entry_type == 'ingredient':
        if 'cookTime' not in data or not isinstance(data['cookTime'], int):
            return jsonify({'msg': 'error found'}), 400

        success, ingredient_obj = parse_ingredient(entry_name, data['cookTime'])
        if success:
            cookbook[entry_name] = ingredient_obj
            
            print(cookbook)
            return {}, 200
        return jsonify({'msg': 'error'}), 400
    else:
	    return jsonify({'msg': 'error'}), 400

def parse_recipe(name, required_items):
    required_items_set = set()
    parsed_items = []

    for item in required_items:
        if 'name' not in item or 'quantity' not in item:
            return False, None
        if not isinstance(item['name'], str) or not isinstance(item['quantity'], int) or item['quantity'] <= 0:
            return False, None
        
        parsed_name = parse_handwriting(item['name'])
        if parsed_name in required_items_set:
            return False, None

        required_items_set.add(parsed_name)
        parsed_items.append(RequiredItem(name=parsed_name, quantity=item['quantity']))

    return True, Recipe(name=name, required_items=parsed_items)

def parse_ingredient(name, cook_time):
    if cook_time < 0:
        return False, None
    return True, Ingredient(name=name, cook_time=cook_time)


# [TASK 3] ====================================================================
# Endpoint that returns a summary of a recipe that corresponds to a query name
@app.route('/summary', methods=['GET'])
def summary():
    # TODO: implement me
    return 'not implemented', 500


# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == '__main__':
    app.run(debug=True, port=8080)
