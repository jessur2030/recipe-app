import View from './View.js';
import previewView from './previewView.js';
import icons from 'url:../../img/icons.svg'; // Parcel 2

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query! please try again.';
  _message = '';
  _generateMarkup() {
    // console.log(this._data);
    //console.log(this._data[0].title);
    return this._data.map(result => previewView.render(result, false)).join();
  }
}

export default new ResultsView();
