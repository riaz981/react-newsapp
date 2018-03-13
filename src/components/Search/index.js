import React, { Component } from 'react';
import {FormGroup} from 'react-bootstrap';
import { Button } from '../Button/index';


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

export default Search;