import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: any = {};

// Task 1 helper (don't touch)
app.post("/parse", (req: Request, res: Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  if (!/[a-zA-Z]/.test(recipeName)) {
    return null;
  }
  // 1. Replace - & _ with whitespace
  recipeName = recipeName.replace(/[-_]/g, " ");
  
  // 2. Non-alphabetic characters removed
  recipeName = recipeName.replace(/[^a-zA-Z ]/g, "");
  
  // 3. Make all lowercase
  recipeName = recipeName.toLowerCase();
  
  // 4. Multiple whitespaces should be truncated to one
  recipeName = recipeName.replace(/\s+/g, " ").trim();
  
  // 5. First character capitalised
  recipeName = recipeName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return recipeName;
};
// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req: Request, res: Response) => {
  const data = req.body;
  
  // Basic error handling
  if (!data.name || !data.type) {
    res.status(400).json({ msg: "error found" });
    return;
  }

  // Maybe data['name'] can be invalid
  const entryName = parse_handwriting(data.name);
  if (entryName === null) {
    res.status(400).json({ msg: "error found" });
    return;
  }

  // Check for duplicate entry name
  if (cookbook[entryName]) {
    res.status(400).json({ msg: "error found" });
    return;
  }

  // Error handling for recipe
  if (data.type === "recipe") {
    if (!data.requiredItems || !Array.isArray(data.requiredItems)) {
      res.status(400).json({ msg: "error found" });
      return;
    }
    const [success, recipeObj] = parseRecipe(entryName, data.requiredItems);
    if (success && recipeObj) {
      cookbook[entryName] = recipeObj;
      res.status(200).json({});
      return;
    }
    res.status(400).json({ msg: "error found" });
    return;
  }

  // Error handling for ingredient
  else if (data.type === "ingredient") {
    if (data.cookTime === undefined || typeof data.cookTime !== "number") {
      res.status(400).json({ msg: "error found" });
      return;
    }
    const [success, ingredientObj] = parseIngredient(entryName, data.cookTime);
    if (success && ingredientObj) {
      cookbook[entryName] = ingredientObj;
      res.status(200).json({});
      return;
    }
    res.status(400).json({ msg: "error found" });
    return;
  } 

  // Everything else should be an error
  else {
    res.status(400).json({ msg: "error found" });
    return;
  }
});

const parseRecipe = (
  name: string,
  requiredItems: any[]
): [boolean, recipe | null] => {
  const requiredItemsSet = new Set<string>();
  const parsedItems: requiredItem[] = [];

  for (const item of requiredItems) {
    if (!item.hasOwnProperty("name") || !item.hasOwnProperty("quantity")) {
      return [false, null];
    }
    if (
      typeof item.name !== "string" ||
      typeof item.quantity !== "number" ||
      item.quantity <= 0
    ) {
      return [false, null];
    }
    const parsedName = parse_handwriting(item.name);
    if (parsedName === null) {
      return [false, null];
    }
    if (requiredItemsSet.has(parsedName)) {
      return [false, null];
    }
    requiredItemsSet.add(parsedName);
    parsedItems.push({ name: parsedName, quantity: item.quantity });
  }

  const recipeObj: recipe = {
    name: name,
    type: "recipe",
    requiredItems: parsedItems,
  };

  return [true, recipeObj];
};

const parseIngredient = (
  name: string,
  cookTime: number
): [boolean, ingredient | null] => {
  if (cookTime < 0) {
    return [false, null];
  }
  const ingredientObj: ingredient = {
    name: name,
    type: "ingredient",
    cookTime: cookTime,
  };
  return [true, ingredientObj];
};


// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req: Request, res: Request) => {
  // The logic for this code is well-documented in devdonalds.py

  const nameQuery = req.query.name;
  if (!nameQuery || typeof nameQuery !== "string") {
    res.status(400).json({ msg: "error found" });
    return;
  }
  const name = nameQuery;

  const [valid1, _] = traverse(name, 1);
  if (!valid1) {
    res.status(400).json({ msg: "error found" });
    return;
  }
  const [valid2, recipe] = traverse(name, 2);
  if (!valid2 || recipe === null) {
    res.status(400).json({ msg: "error found" });
    return;
  }
  res.status(200).json(recipe);
});

function traverse(targetName: string, option: number): [boolean, any] {
  if (option !== 1 && option !== 2) {
    return [false, null];
  }

  // Option 1: Check that the target exists and is a recipe.
  if (option === 1) {
    if (!cookbook[targetName]) {
      return [false, null];
    }
    const entry = cookbook[targetName];
    if (entry.type === "ingredient") {
      return [false, null];
    }
    return [true, null];
  }
  
  // Option 2: Perform BFS to calculate total cookTime and ingredients.
  else if (option === 2) {
    const entry = cookbook[targetName];
    const ingredientCount: { [key: string]: number } = {};
    const queue: Array<[recipe | ingredient, number]> = [];
    queue.push([entry, 1]);

    while (queue.length > 0) {
      const [current, multiplier] = queue.shift()!;
      if (current.type === "ingredient") {
        ingredientCount[current.name] =
          (ingredientCount[current.name] || 0) + multiplier;
      } else if (current.type === "recipe") {
        for (const requiredItem of (current as recipe).requiredItems) {
          if (!cookbook[requiredItem.name]) {
            return [false, null];
          }
          const child = cookbook[requiredItem.name];
          queue.push([child, multiplier * requiredItem.quantity]);
        }
      } else {
        return [false, null];
      }
    }

    let totalCookTime = 0;
    const ingredientsList: Array<{ name: string; quantity: number }> = [];
    for (const ingredientName in ingredientCount) {
      const entry = cookbook[ingredientName];
      if (!entry || entry.type !== "ingredient") {
        return [false, null];
      }
      totalCookTime += ingredientCount[ingredientName] * (entry as ingredient).cookTime;
      ingredientsList.push({
        name: ingredientName,
        quantity: ingredientCount[ingredientName],
      });
    }

    const formattedRecipe = {
      name: targetName,
      cookTime: totalCookTime,
      ingredients: ingredientsList,
    };
    return [true, formattedRecipe];
  }
  return [false, null];
}

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
