import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App, { Search, Button, Table } from './App';

Enzyme.configure({ adapter: new Adapter() });

describe('App', () => {

	it('отрисовывает без ошибок', () => {
		const div = document.createElement('div');
		ReactDOM.render(<App />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

	test('есть корректный снимок', () => {
		const component = renderer.create(
			<App />
		);
		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

});

describe('Search', () => {

	it('отрисовывает без ошибок', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Search>Поиск</Search>, div);
		ReactDOM.unmountComponentAtNode(div);
	});

	test('есть корректный снимок', () => {
		const component = renderer.create(
			<Search>Поиск</Search>
		);
		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

});

describe('Button', () => {

	it('отрисовывает без ошибок', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Button>Дай мне больше</Button>, div);
		ReactDOM.unmountComponentAtNode(div);
	});

	test('есть корректный снимок', () => {
		const component = renderer.create(
			<Button>Дай мне больше</Button>
		);
		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it('shows to button', () => {
		const element = shallow(
			<Button>Поиск</Button>
		);

		expect(element.length).toBe(1);
	});

});

describe('Table', () => {

	const props = {
		list: [
			{ title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
			{ title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' },
		],
		sortKey: 'TITLE',
		isSortReverse: false,
	};

	it('отрисовывает без ошибок', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Table { ...props } />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

	test('есть корректный снимок', () => {
		const component = renderer.create(
			<Table { ...props } />
		);
		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it('shows to items in list', () => {
		const element = shallow(
			<Table { ...props } />
		);

		expect(element.find('.table-row').length).toBe(2);
	})

});