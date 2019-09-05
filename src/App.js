import React, { Component } from 'react';
import './App.css';

// const DEFAULT_QUERY = 'redux';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = '&page='

const isNotNullTitle = item => item.title !== null && item.title !== "";

const Search = ({ value, onChange, onSubmit, children }) =>
  <form onSubmit={onSubmit}>
   <i className="fa fa-search"></i>
	<input
      type="text"
      value={value}
      onChange={onChange}
   />
	<button type="submit">
		Поиск
	</button>
  </form>

const Table = ({ list, onDismiss }) =>
	<div className="table">
		{list.filter(isNotNullTitle).map(item =>
			<div key={item.objectID} className="table-row">
				<span style={{ width: '40%' }}>
					<a href={item.url}>{item.title}</a>
				</span>
				<span style={{ width: '20%' }}>
					{item.author}
				</span>
				<span style={{ width: '10%' }}>
					{item.author}
				</span>
				<span style={{ width: '10%' }}>
					{item.num_comments}
				</span>
				<span style={{ width: '10%' }}>
					{item.points}
				</span>
				<span style={{ width: '10%' }}>
					<Button
						onClick={() => onDismiss(item.objectID)}
						className="button-inline"
					>
						Удалить
					</Button>
				</span>
			</div>
		)}
  	</div>

const PageControls = ({ onClickPrev, onClickNext, page }) =>
	<div className="pageControls">
		<Button
			onClick={() => onClickPrev()}
			className="btn-page-cntrl"
		>
			Prev
		</Button>
			{/* Вынести в компонент и сделать активным по нажатию */}
			<span className="num-page active-page">{ page + 1 }</span>
			<span className="num-page">{ page + 2 }</span>
			<span className="num-page">{ page + 3 }</span>
			{/* показывать когда возможно с тек страницы + 10 (макс 50 стр) */}
			<span className="num-page">...</span>
			<span className="num-page" onClick={() => onClickPrev()}>{ page + 11 }</span>
		<Button
			onClick={() => onClickNext()}
			className="btn-page-cntrl"
		>
			Next
		</Button>
	</div>

const Button = ({	onClick,	className = '', children, }) =>
  	<button
   	onClick={onClick}
   	className={className}
   	type="button"
  	>
   	{children}
  	</button>

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			result: null,
			searchTerm: '',
			page: 0,
		};

		this.setSearchTopStories = this.setSearchTopStories.bind(this);
		this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
		this.onSearchChange = this.onSearchChange.bind(this);
		this.onSearchSubmit = this.onSearchSubmit.bind(this);
		this.onDismiss = this.onDismiss.bind(this);
		this.onClickPrev = this.onClickPrev.bind(this);
		this.onClickNext = this.onClickNext.bind(this);
	}
	  
	setSearchTopStories(result) {
		this.setState({ result });
	}

	fetchSearchTopStories(searchTerm, page) {
		console.log(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}${PARAM_PAGE}${page}`);
		fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}${PARAM_PAGE}${page}`)
		.then(response => response.json())
		.then(result => this.setSearchTopStories(result))
		.catch(error => error);
	}
		
  	onSearchChange(event) {
  		this.setState({ searchTerm: event.target.value });
	}
	
	onSearchSubmit(event) {
		const { searchTerm } = this.state;
		this.setState({ page: 0 });
		const { page } = this.state;
		this.fetchSearchTopStories(searchTerm, page);
		event.preventDefault();
	}
		
  	onDismiss(id) {
		const isNotId = item => item.objectID !== id;
		const updatedHits = this.state.result.hits.filter(isNotId);
		this.setState({ 
			result: { ...this.state.result, hits: updatedHits }
		});
	}
	  
	componentDidMount() {
		const { searchTerm, page } = this.state;
		this.fetchSearchTopStories(searchTerm, page);
	}

	onClickPrev() {
		const { searchTerm } = this.state;

		if (this.state.page === 0) return 

		this.setState(
			{ page: this.state.page - 1 }, 
			() => this.fetchSearchTopStories(searchTerm, this.state.page)
		);
	}

	onClickNext() {
		const { searchTerm } = this.state;

		this.setState(
			{ page: this.state.page + 1 }, 
			() => this.fetchSearchTopStories(searchTerm, this.state.page)
		);
	}

  	render() {
		const { searchTerm, result } = this.state;

		if (!result) { return null; }

		return (
			<div className="page">
				<div className="interactions">
					{ console.log(this.state) }
					<Search
						value={searchTerm}
						onChange={this.onSearchChange}
						onSubmit={this.onSearchSubmit}
					/>
				</div>
				{ result
				  	? <Table
					  list={result.hits}
					  onDismiss={this.onDismiss}
				  	/>
					: null
				}
				<PageControls
					onClickPrev={this.onClickPrev}
					onClickNext={this.onClickNext}
					page={this.state.page}
				/>
      	</div>
   	);
  	}
}

export default App;