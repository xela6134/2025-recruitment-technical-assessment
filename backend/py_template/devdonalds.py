from dataclasses import dataclass
from typing import List, Dict, Union
from flask import Flask, request, jsonify
from collections import deque, defaultdict
import re, pprint

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

    # Error handling for recipe
    if entry_type == 'recipe':
        # Extra error handling (type safety)
        if 'requiredItems' not in data or not isinstance(data['requiredItems'], list):
            return jsonify({'msg': 'error found'}), 400

        success, recipe_obj = parse_recipe(entry_name, data['requiredItems'])

        if success:
            # Add to cookbook
            cookbook[entry_name] = recipe_obj
            return jsonify({}), 200
        return jsonify({'msg': 'error found'}), 400

    # Error handling for ingredient
    elif entry_type == 'ingredient':
        if 'cookTime' not in data or not isinstance(data['cookTime'], int):
            return jsonify({'msg': 'error found'}), 400

        success, ingredient_obj = parse_ingredient(entry_name, data['cookTime'])

        if success:
            # Add to cookbook
            cookbook[entry_name] = ingredient_obj            
            return jsonify({}), 200
        return jsonify({'msg': 'error found'}), 400
    else:
	    return jsonify({'msg': 'error found'}), 400

def parse_recipe(name, required_items):
    # Checking for duplicates with set()
    required_items_set = set()
    parsed_items = []

    for item in required_items:
        # Error handling, just in case recipe's JSON format is invalid
        if 'name' not in item or 'quantity' not in item:
            return False, None

        if not isinstance(item['name'], str) or not isinstance(item['quantity'], int) or item['quantity'] <= 0:
            return False, None
        
        # Just in case name is invalid format        
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
    # Plan:
    # 1. Basic Error Handling
    #    Traverse through the current cookbook 1 (Naive search)
    #   - Searched name is not found
    #   - Searched name is an ingredient
    # 2. Additional error handling
    #    Traverse through the current cookbook 2 (BFS)
    #   - Recipe's requiredItems has not been satisfied
    #   - All leaf nodes are ingredients (additional field check)
    #       - If not leaf node, we cannot calculate quantities
    # 3. During traversal 2, for each leaf node,
    #    make the new Recipe structure, with the whole cookTime and ingredients.

    name = request.args.get('name', str)
    
    valid, _ = traverse(name, 1)
    
    if not valid:
        return jsonify({'msg': 'error found'}), 400
    
    valid, recipe = traverse(name, 2)
    
    if not valid:
        return jsonify({'msg': 'error found'}), 400

    return jsonify(recipe), 200

# Returns error (bool), recipe (raw json)
def traverse(target_name: str, option: int):
    # Option 1 for traversal 1, Option 2 for traversal 2, Option 3 for debugging and printing everything
    if option != 1 and option != 2 and option != 3:
        return False

    if option == 1:
        # Target is not in cookbook
        if target_name not in cookbook:
            return False, None

        entry = cookbook[target_name]
        # Target is an ingredient
        if isinstance(entry, Ingredient):
            return False, None

        # Target is a valid recipe
        return True, None

    elif option == 2:
        entry = cookbook[target_name]
        
        # Maps ingredient name to total quantity, missing key of defaultdict(int) returns 0
        ingredient_count = defaultdict(int)
        
        # Conduct a BFS
        queue = deque()
        queue.append((entry, 1))
        
        while queue:
            current, multiplier = queue.popleft()
            
            if isinstance(current, Ingredient):
                ingredient_count[current.name] += multiplier
            elif isinstance(current, Recipe):
                for required_item in current.required_items:
                    # Error if cookbook doesn't contain that required item
                    if required_item.name not in cookbook:
                        return False, None
                    
                    child = cookbook[required_item.name]
                    queue.append((child, multiplier * required_item.quantity))
            else:
                return False, None
        
        # Calculate total cooking time
        total_cooktime = 0
        ingredients_list = []
        
        # Build ingredients list
        for ingredient, quantity in ingredient_count.items():
            # We don't want recipes left, only need pure ingredients to calculate total cooking time
            if ingredient not in cookbook or not isinstance(cookbook[ingredient], Ingredient):
                return False, None
            
            total_cooktime += quantity * cookbook[ingredient].cook_time
            ingredients_list.append({
                "name": ingredient,
                "quantity": quantity
            })
        
        formatted_recipe = {
            "name": target_name,
            "cookTime": total_cooktime,
            "ingredients": ingredients_list
        }
        return True, formatted_recipe

    elif option == 3:
        pprint.pprint(cookbook)
        return True, None

# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == '__main__':
    app.run(debug=True, port=8080)
