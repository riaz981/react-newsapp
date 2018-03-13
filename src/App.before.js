import React, { Component } from 'react';
import logo from './logo.svg';
import {Grid, Row, FormGroup} from 'react-bootstrap';
import list from './list.js';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';

import{
    DEFAULT_QUERY, DEFAULT_PAGE, DEFAULT_HPP,
    PATH_BASE, PATH_SEARCH, PARAM_SEARCH, PARAM_PAGE, PARAM_HITS
} from './constants/index'


const SORTS = {
    NONE: list => list,
    TITLE: list => sortBy(list, 'title'),
    AUTHOR: list => sortBy(list, 'author'),
    COMMENTS: list => sortBy(list, 'num_comments').reverse(),
    POINTS: list => sortBy(list, 'points').reverse(),
}
// //default parameters to fetch data from the api
// const DEFAULT_QUERY = 'react';
// const DEFAULT_PAGE = 0;
// const DEFAULT_HPP = 100;
// const PATH_BASE = 'https://hn.algolia.com/api/v1';
// const PATH_SEARCH = '/search';
// const PARAM_SEARCH = 'query=';
// const PARAM_PAGE = 'page=';
// const PARAM_HITS = 'hitsPerPage=';

// const url = PATH_BASE + PATH_SEARCH + '?' + PARAM_SEARCH + DEFAULT_QUERY;
const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}${DEFAULT_PAGE}&${PARAM_HITS}${DEFAULT_HPP}`;
console.log(url);


function isSearched(searchTerm){
    return(function(item){
        
        /*
        if(!searchTerm){
            return true;
        }
        else if(item.title.toLowerCase().includes(searchTerm.toLowerCase())){
            return true;
        }
        */
        //look at the above commented out statements
        //Mainly if there is no searchTerm return the whole list
        //or if searchTerm matches any of the title return true and only
        //return that array object filter out the rest
        return !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

}

const withLoading = (Component) => (isLoading, ...rest) =>
    isLoading ? <Loading/> : <Component {...rest}/>

const updateTopStories = (hits, page) => prevState =>{
    const {searchKey, results, isLoading} = prevState;
    //if the page number is not 0 then result original hits
    //from the state or otherwise just make old hits empty array
    //const oldHits = page !==0 ? this.state.result.hits : [];

    // if there are results then if there are results with searhKey return the hits of it or return empty array.
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    // merge oldHits and new hits
    const updatedHits = [...oldHits, ...hits];
    //set the result in the state(original) and add to it the updated hits and page
   // this.setState({ result: {hits: updatedHits, page}} );

   //to results...in curly brackets take results add to it array searchkey and to it add updatedHits and page
   return {results: {...results, [searchKey]: {hits: updatedHits, page}}, isLoading: false }
}

class App extends Component {

//setting up internal component state
//ES6 class can use constructor to initialize internal state
  constructor(props){
    //super props sets this.props to the constructor
    super(props);
    this.state = {
      results: null,
      searchTerm: DEFAULT_QUERY,
      searchKey: 'Riaz',
      isLoading: false,
    }

    // bind the functions to this (app component)
    this.removeItem = this.removeItem.bind(this);
    this.searchValue = this.searchValue.bind(this);
    this.fetchTopStories = this.fetchTopStories.bind(this);
    this.setTopStories = this.setTopStories.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
}

    
    //set top stories
    setTopStories(result){
        //from the fetch get the hit and page of the updated result
        const {hits, page} = result;
        this.setState(updateTopStories(hits, page));
        
        //previously it was as below. this will be useful for pagination
        //with page numbers
        //this.setState({result: result})
    }

    //fetch top stories and pass searchTeam as parameter
    fetchTopStories(searchTerm,page){
        //this where it will show loading while fetch() loads data
        this.setState({isLoading: true});
        //fetch() is a new javascript method to make http request
        //previously we had to use XMLHttpRequest()
        //the response we get we convert to json format
        //we then send this resonse to the function setTopStories
        fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HITS}${DEFAULT_HPP}`).then(response => response.json())
        .then(result => this.setTopStories(result))
        .catch(e =>e);
    }

    //check top stories search term
    checkTopStoriesSearchTerm(searchTerm){
        return !this.state.results[searchTerm];
    }

    //onSubmit function for server side search
    onSubmit(event){
        const{searchTerm} = this.state;
        this.setState({searchKey: searchTerm});
        console.log(searchTerm);

        if(this.checkTopStoriesSearchTerm(searchTerm)){
            this.fetchTopStories(searchTerm, DEFAULT_PAGE); 
        }
        
        event.preventDefault();

    }
  
  //What this does is before executing components it goes to api and stores the result and sets the result state
  // After didmount is executed then the render() function is executed and components start to load with result
  componentDidMount(){
    const{searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    this.fetchTopStories(searchTerm, DEFAULT_PAGE);
  }

  // removeItem(id){
  //   function isNotId(item){
  //     return item.objectID !== id;
  //   }

  //   const updatedList = this.state.list.filter(isNotId);
  //   this.setState({ list: updatedList});
  // }

  removeItem(id){
    const { results, searchKey } = this.state;
    const {hits, page} = results[searchKey];
    
    const updatedList = hits.filter((item) => item.objectID !== id);

    //merge updated list with results
    this.setState({results: {...results, [searchKey]: {hits: updatedList, page}}});

    
    //console.log(result);
    //console.log(updatedList);
    //if you dont merge result and hits as in make setState 
    // and assign result.hits as below filter in table will be undefined
    //below is taking result object and to its hits its adding updated list
    //in setState you cant do this.setState({result.hits: updatedList});
    //that causes an error so to assign new value using setState we have to use below version
   //this.setState({result: {...result, hits: updatedList}});
   //console.log(result.hits);
    //this.setState({result: result.hits});
  }

  //remember as soon as the state changes it updates the view
  //in onsubmit if the data for search term already exists it does nothing
  //but on change is triggered in that case which comes here and chnages the state
  //as soon as that happens the render method triggers again and updates the result. as the result is already stored locally (check react chrome developers tool select app) it just updates the view from that result.
  searchValue(event){
    this.setState({searchTerm: event.target.value});
  }

  render() {
    //in es6 we can create 2 variables like below and assign list and 
    //search term from this.state to these variables
     const{results, searchTerm, searchKey, isLoading} = this.state;
     //console.log(sortKey);
     // if(!result){
     //    return null;
     // }
     {/*as above we assigned list and searchTerm values from this.state we can modify below from this.state.list.filter to just list.filter. also this.state.searchTerm can be changed to just searchTerm below
          */}

    //the below was not explained in the video. It mainly means is
    //logical && meanning if result is true then return result.page
    //else result 0
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
     <div>
         <Grid fluid>
            <Row>
                <div className="jumbotron text-center">
                    <Search
                        onChange={this.searchValue}
                        value={searchTerm}
                        onSubmit={this.onSubmit}
                    >NEWSAPP</Search>
                </div>
            </Row>
         </Grid>
         
        <div id="searchStuff">
        </div>
        {/* below just means if there is result print out table else null 
             { 
            results &&
             <Table 
                sortKey={sortKey}
                onSort={this.onSort}
                list={ list }
                searchTerm={ searchTerm }
                removeItem={ this.removeItem }
            />
            
        }
        */}
       <Grid>
            <Row>
                <Table     
                    list={ list }
                    removeItem={ this.removeItem }
                    />

                <div className="text-center alert">
                    {   

                        <ButtonWithLoading
                            isLoading={isLoading}
                            className="bt btn-success searchBtn"
                            onClick={ () => this.fetchTopStories(searchTerm, page+1)}
                        >
                            Load more
                        </ButtonWithLoading>
                    }
                </div>
            </Row>
        </Grid>
    </div>
    );
  }
}

 //class Search extends Component{
//     render(){
//         const {onChange, value} = this.props;
//         return(
//         <form>
//             <input 
//                 type="text" 
//                 onChange={onChange} //is mainly onChange{this.searchValue}
//                 value={value} //is mainly {searchTerm}
//             />
//         </form>
//         )
        
//     }
    
// }

//const Search = ({onChange, value, children, onSubmit}) =>
class Search extends Component{
    componentDidMount(){
        this.input.focus();
    }
    render(){
        const {onChange, value, children, onSubmit} = this.props;
        return(
            <form onSubmit={ onSubmit }>
                <FormGroup>
                        <h1 style={{ fontWeight: 'bold'}}>{children}</h1><hr style={{border: '1px solid black', width: '100px'}}/>
                        <div className="input-group">
                            <input 
                                className="form-control searchForm"
                                type="text" 
                                onChange={onChange}
                                value={value}
                                ref= {
                                    (node)=>
                                    this.input = node
                                }
                            />
                            <span className="input-group-btn">
                              <Button
                                className="btn btn-primary searchBtn"
                                type="submit"
                              >
                                Search
                              </Button>
                            </span>
                        </div>

                    </FormGroup>
            </form>
        )
    }
}
// class Table extends Component{
//     render(){
//         const {list, searchTerm, removeItem} = this.props;
//         return(
//            <div>
//                 {
//                     list.filter(isSearched(searchTerm)).map((item) =>
//                         <div key={item.objectID}>
//                           <h1> <a href={item.url} target="_blank">{ item.title }</a> by { item.author }</h1>
//                           <h4> {item.num_comments} Comments| {item.points} Points</h4>
//                           <Button 
//                             type="button" 
//                             onClick={()=> removeItem(item.objectID)}>Remove Me
//                             </Button>
//                         </div>
//                     )
//                   }
//            </div> 
//         )
//     }
// }

//const Table = ({list, searchTerm, removeItem, sortKey, onSort, isSortReverse}) => {
class Table extends Component{
    constructor(props){
        super(props);
        this.state={
            sortKey: 'NONE',
            isSortReverse: false,
        }
        this.onSort = this.onSort.bind(this);
    }

    //sorting function
    onSort(sortKey){
        //evaluate if the list is reverse sorted
        //if sortKey is equal to sortKey already and reverse state is not true
        const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
        this.setState({sortKey, isSortReverse});
    }

    render(){
        const {list, removeItem} = this.props;
        const {sortKey, isSortReverse} = this.state;
        console.log(sortKey);
        //we sort the list
        const sortedList = SORTS[sortKey](list);
        //if SortReverse is true then reverse the list else assign normal sortedlist.
        const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
        return(
        <div className="col-sm-10 col-sm-offset-1">
        <div className="text-center" style={{minHeight: '15px'}}>
            <hr/>
            <Sort
                className="btn btn-xs btn-default sortBtn"
                sortKey={'NONE'}
                onSort={this.onSort}
                activeSortKey={sortKey}
            >Default</Sort>
            <Sort
                className="btn btn-xs btn-default sortBtn"
                sortKey={'TITLE'}
                onSort={this.onSort}
                activeSortKey={sortKey}
            >Title</Sort>

            <Sort
                className="btn btn-xs btn-default sortBtn"
                sortKey={'AUTHOR'}
                onSort={this.onSort}
                activeSortKey={sortKey}
            >Author</Sort>

            <Sort
                className="btn btn-xs btn-default sortBtn"
                sortKey={'COMMENTS'}
                onSort={this.onSort}
                activeSortKey={sortKey}
            >Comments</Sort>

            <Sort
                className="btn btn-xs btn-default sortBtn"
                sortKey={'POINTS'}
                onSort={this.onSort}
                activeSortKey={sortKey}
            >Points</Sort>
            <hr/>
        </div>
            {
                //list.filter(isSearched(searchTerm)).map((item) =>
                reverseSortedList.map((item) =>
                    <div key={item.objectID}>
                        <h1> <a href={item.url} target="_blank">{ item.title }</a> by { item.author }</h1>
                        <h4> {item.num_comments} Comments| {item.points} Points
                            <Button 
                                className="btn btn-danger btn-xs"
                                type="button" 
                                onClick={()=> removeItem(item.objectID)}>Remove Me
                            </Button>
                        </h4><hr/>
                    </div>
                )
            }
        </div> 
        )
    }
}
// class Button extends Component{
//     render(){
//         const { onClick, children } = this.props;
//         return(
            
//             <button
//                 onClick={onClick}
//                 type="button"
//             >
//             {children}
//             </button>
//         )
//     }
// }

const Button = ({ onClick, children, className='' }) =>
    <button
        className = {className}
        onClick={onClick}
        type="button"
    >
        {children}
    </button>

    Table.propTypes ={
        list: PropTypes.arrayOf(
            PropTypes.shape({
                objectID: PropTypes.string.isRequired,
                author: PropTypes.string,
                url: PropTypes.string,
                num_comments: PropTypes.number,
                points: PropTypes.number,
            })
        ).isRequired,
        removeItem: PropTypes.func.isRequired,
    }

Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
}

Button.defaultProps = {
  className: '',
}

const Loading = () =>
<div><h2>Loading...</h2></div>


const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, onSort, children, className, activeSortKey}) =>
{
    const sortClass = ['btn default'];
    if(sortKey === activeSortKey){
        sortClass.push('btn btn-primary');
    }
    return(
        <Button
            className={sortClass.join(' ')}
            onClick = {() => onSort(sortKey)}
        >
        {children}
        </Button>
    )
}
export default App;
