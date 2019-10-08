import React, { Component } from 'react';
import { sortBy } from 'lodash';
import { DualRing } from 'react-spinners-css';
import './App.css';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

const SORTS = {
	NONE: list => list,
	TITLE: list => sortBy(list, 'title'),
	AUTHOR: list => sortBy(list, 'author'),
	COMMENTS: list => sortBy(list, 'num_comments').reverse(),
	POINTS: list => sortBy(list, 'points').reverse(),
}

// Убираем записи с пустыми заголовками
const isNotNullTitle = item => item.title !== null && item.title !== "";

// Компонент поиска
const Search = ({ value, onChange, onSubmit, children }) =>
	<div className="interactions">
		<form onSubmit={onSubmit}>
		<i className="fa fa-search"></i>
		<input
			type="text"
			value={value}
			onChange={onChange}
		/>
		<button type="submit">
			Find
		</button>
	</form>
	{children}
	</div>

// Сортируемый заголовок
const Sort = ({ sortKey, onSort, activeSortKey, children }) => {
	// массив названий классов
	const sortClass = ['button-inline'];

	if (sortKey === activeSortKey) {
		sortClass.push('button-active');
	}

	return (
		<Button
			onClick={() => onSort(sortKey)}
			className={sortClass.join(' ')}
		>
			{children}
		</Button>
	);
}

// Компонент отображающий записи в строчку
const Table = ({ list, sortKey, isSortReverse, onSort, onDismiss }) => {
	list = list.filter(isNotNullTitle);

	const sortedList = SORTS[sortKey](list);
	const reverseSortedList = isSortReverse
		? sortedList.reverse()
		: sortedList;

	return (
		<div className="table">
			<div className="table-header">
				<span style={{ width: '40%' }}>
					<Sort
						sortKey={'TITLE'}
						onSort={onSort}
						activeSortKey={sortKey}
					>
						Title
					</Sort>
				</span>
				<span style={{ width: '30%' }}>
					<Sort
						sortKey={'AUTHOR'}
						onSort={onSort}
						activeSortKey={sortKey}
					>
						Author
					</Sort>
				</span>
				<span style={{ width: '10%' }}>
					<Sort
						sortKey={'COMMENTS'}
						onSort={onSort}
						activeSortKey={sortKey}
					>
						Comments
					</Sort>
				</span>
				<span style={{ width: '10%' }}>
					<Sort
						sortKey={'POINTS'}
						onSort={onSort}
						activeSortKey={sortKey}
					>
						Points
					</Sort>
				</span>
				<span style={{ width: '10%' }}>
					Archive
				</span>
			</div>
			{reverseSortedList.map(item =>
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
	);
}

// Компонент кнопки
const Button = ({	onClick,	className = '', children, }) =>
  	<button
   	onClick={onClick}
   	className={className}
   	type="button"
  	>
   	{children}
  	</button>

// HOC
const withLoading = (Component) => ({ isLoading, ...other }) =>
	isLoading
		? <DualRing color="#202020"/>
		: <Component { ...other }/>
	
const ButtonWithLoading = withLoading(Button);

// Main компонент
class App extends Component {
	// Состояние компонента на момент мотирования и размонтирования
	_isMounted = false;

	constructor(props) {
		super(props);

		this.state = {
			results: null,
			searchKey: '',
			searchTerm: '',
			error: null,
			isLoading: false,
			sortKey: 'NONE',
			isSortReverse: false,
		};

		// Биндинг контекста
		this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
		this.setSearchTopStories = this.setSearchTopStories.bind(this);
		this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
		this.onSearchChange = this.onSearchChange.bind(this);
		this.onSearchSubmit = this.onSearchSubmit.bind(this);
		this.onDismiss = this.onDismiss.bind(this);
		this.onSort = this.onSort.bind(this);
	}

	// (Cache):: проверяет и возвращает !true/!false в зависимости от нахождения
	//  поискового слова и его данных из API
	needsToSearchTopStories(searchTerm) {
		return !this.state.results[searchTerm];
	}
	
	// Сохраняет и объединяет старые поиски с новыми в состояние results
	setSearchTopStories(result) {
		const { hits, page } = result;
		const { searchKey, results } = this.state;

		// Старые записи (если есть) для объединения с новыми (result)
		const oldHits = results && results[searchKey]
			? results[searchKey].hits
			: [];

		// Объединяем старые записи с новыми полученными из API
		const updatedHits = [
			...oldHits,
			...hits
		];

		// results + новый запрос
		// results имеет вид: {"@NameSearchTerm": 
		// 								hits:{}, 
		// 								page: 0} 
		this.setState({ 
			results: { 
				...results,
				[searchKey]: { hits: updatedHits, page: page }
			},
			isLoading: false
		});
	}

	// Получение данных из API
	fetchSearchTopStories(searchTerm, page = 0) {
		this.setState({ isLoading: true });

		fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`)
			.then(response => response.json())
			// Устанавливаем занчение/выводим ошибку, если компонент монитрован
			// this._isMounted && this.setSearchTopStories(result) выполнится когда
			// this._isMounted == true
			.then(result => this._isMounted && this.setSearchTopStories(result))
			.catch(error => this._isMounted && this.setState({ error: error }));
	}
		
	// При вводе в поле input в форме search записывает занчение вводимого слова
  	onSearchChange(event) {
  		this.setState({ searchTerm: event.target.value });
	}
	
	// При нажатии на кнопку сохраняем написанное слово в searchKey
	onSearchSubmit(event) {
		const { searchTerm } = this.state;
		this.setState({ searchKey: searchTerm });

		// (Cache):: если такого поиского слова еще не вводили то делаем запрос API
		// Иначе берем из кеша
		if (this.needsToSearchTopStories(searchTerm)) {
			this.fetchSearchTopStories(searchTerm);	
		}

		// При подтверждении формы отменяем обновление страницы
		event.preventDefault();
	}
	
	// Удаление строки записи из результата, и сохраняем новый список записей в кеш
  	onDismiss(id) {
		const { searchKey, results } = this.state;
		const { hits, page } = results[searchKey];

		const isNotId = item => item.objectID !== id;
		const updatedHits = hits.filter(isNotId);

		this.setState({
			results: {
				...results,
				[searchKey]: {hits: updatedHits, page: page}
			}
		});
	}

	// Метод сортировки по нажатию на заголовки таблицы
	onSort(sortKey) {
		const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
		this.setState({ sortKey, isSortReverse });
	}
	
	// После первого render() метода компонента делаем запрос (1 запрос API)
	componentDidMount() {
		// Компонент монтирован
		this._isMounted = true;

		const { searchTerm, page } = this.state;
		this.setState({ searchKey: searchTerm });
		this.fetchSearchTopStories(searchTerm, page);
	}
	
	componentWillUnmount() {
		// Компонент размонтирован
		this._isMounted = false;
	}

  	render() {
		const {
			searchTerm,
			results,
			searchKey,
			error,
			isLoading,
			sortKey,
			isSortReverse
		} = this.state;

		// Если уже есть results И results со значением searchKey И у этого значения есть страница,
		// то page = results[searchKey].page, иначе page = 0
		const page = (
			results && 
			results[searchKey] &&
			results[searchKey].page
		) || 0;

		// Если уже есть results И results со значением searchKey И у этого значения есть записи,
		// то list = results[searchKey].hits, иначе page = 0
		const list =(
			results &&
			results[searchKey] &&
			results[searchKey].hits
		) || [];

		return (
			<div className="page">
				{/* { console.log(this.state) } */}
				<Search
					value={searchTerm}
					onChange={this.onSearchChange}
					onSubmit={this.onSearchSubmit}
				>
				</Search>
				{ error
					? <div className="interactions">
						<p>Something went wrong.</p>
					</div>
					: <div>
						<Table
							list={list}
							sortKey={sortKey}
							isSortReverse={isSortReverse}
							onSort={this.onSort}
							onDismiss={this.onDismiss}
						/>
						<div className="interactions">
							<ButtonWithLoading
								isLoading={isLoading}
								onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
							>
								Get more
							</ButtonWithLoading>
						</div>
					</div>
				}
      	</div>
   	);
  	}
}

export default App;

export {
	Button,
	Search,
	Table,
};