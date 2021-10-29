import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeViews.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

//const url = `https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886`;

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    //guard clause
    if (!id) return;
    recipeView.renderSpinner();

    //0: update result view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //1: updating bookmark view
    bookmarksView.update(model.state.bookmarks);

    //2: loading recipe
    await model.loadRecipe(id);

    //3: rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    // alert(err);
    recipeView.renderError();
    console.error(err);
  }
};

//Search field function
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //console.log(resultsView);
    //1:Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2:Load search results
    await model.loadSearchResults(query);

    //3: Render results
    resultsView.render(model.getSearchResultsPage());

    // 4: Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

// renders pagination when buttons are clicked
const controlPagination = function (goToPage) {
  //1: Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2: Render New pagination buttons
  paginationView.render(model.state.search);
};

//update recipe servings
const controlServings = function (newServings) {
  // update the recipe servings (in state)
  model.updateServings(newServings);
  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

//controller for adding a new bookmark
const controlAddBookmark = function () {
  // 1: add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2: update recipe view
  recipeView.update(model.state.recipe);

  //3:Render the bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

//recipe new added recipe data from form
const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    //upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change ID in Url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back();

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

//subscriber : init
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
