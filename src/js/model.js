//////////////////////////////////////////////////
//***state Object : */

import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, API_KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

//export state: so we can use it in the controller
//state : stores data from application
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

//export loadRecipe: so we can use it in the controller
//NOTE: this function is responsible for fetching the recipe data form recipe API
export const loadRecipe = async function (id) {
  try {
    //err
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);

    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    // console.log(recipe);

    // console.log(state.recipe);
  } catch (err) {
    //temp error handler
    console.error(`${err} 💥💥💢`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    //getJSON() Returns a promise, then we await that promise and store it in const data
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    // console.log(data);

    //  data.data.recipes : Array from api
    //stores data in the state object : state.search.results []
    state.search.results = data.data.recipes.map(rec => {
      //@@ return a new object
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    //temp error handler
    console.error(`${err} 💥💥💢`);
    throw err;
  }
};

//
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; //0;
  const end = page * state.search.resultsPerPage; //9;
  // console.log(start, end);
  return state.search.results.slice(start, end);
};

//update recipe servings

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    // newQT  = oldQT * newServings / oldS]Servings  // 2 * / 4 = 4
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

//localStorage : whatever add/delete bookmarked
//data persist in local storage
const persistBookMarks = function () {
  //
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

//Adds bookmark function : receives a recipe, and sets recipe as a book mark
export const addBookMark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);
  // state.bookmarks = [...recipe];

  //Mark current recipe
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookMarks();
};

export const deleteBookmark = function (id) {
  //delate bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  //Mark current recipe as NOT bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookMarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

//debugging doting development function
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    // console.log(Object.entries(newRecipe));
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            `Wrong ingredient format! Please use the correct format.`
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    //creates the object that is ready to be uploaded to api
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    //Create  Ajax request
    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    //stores data into the state
    state.recipe = createRecipeObject(data);
    addBookMark(state.recipe);
  } catch (err) {
    throw err;
  }
};
