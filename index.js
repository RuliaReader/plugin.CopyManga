let headers = {
	'Platform': 1,
	'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,ja;q=0.5',
	'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
}

const userConfig = window.Rulia.getUserConfig()

let authorization = false;

if (userConfig.authorization) {
	authorization = userConfig.authorization;
}

async function setMangaListFilterOptions() {
	const url = 'https://www.copy20.com/api/v3/h5/filter/comic/tags';
	try {
		let result = [{
				label: '主题',
				name: 'theme',
				options: [{
					label: '推荐',
					value: 'recommend'
				}, {
					label: '全部',
					value: 0
				}]
			},
			{
				label: '地区/进度',
				name: 'top',
				options: [{
					label: '全部',
					value: 0
				}]
			}
		]
		if (authorization) {
			result[0].options.push({
				label: '书架',
				value: 'bookshelf'
			})
		}
		const rawResponse = await window.Rulia.httpRequest({
			url: url,
			method: 'GET',
			payload: 'format=json&type=1',
			headers: headers
		});
		const response = JSON.parse(rawResponse);
		for (let item of response.results.theme) {
			result[0].options.push({
				label: item.name,
				value: item.path_word
			})
		}
		for (let item of response.results.top) {
			result[1].options.push({
				label: item.name,
				value: item.path_word
			})
		}
		window.Rulia.endWithResult(result);
	} catch (error) {
		window.Rulia.endWithResult([])
	}
}

async function getMangaListByRecommend(page, pageSize) {
	const url =
		'https://www.copy20.com/api/v3/recs';
	try {
		const rawResponse = await window.Rulia.httpRequest({
			url: url,
			method: 'GET',
			payload: 'format=json&limit=' + pageSize + '&offset=' + ((page - 1) * pageSize) +
				'&pos=3200102',
			headers: headers
		});
		const response = JSON.parse(rawResponse);
		let result = {
			list: []
		}
		for (let manga of response.results.list) {
			let comic = {
				title: manga.comic.name,
				url: 'https://www.mangacopy.com/comic/' + manga.comic.path_word,
				coverUrl: manga.comic.cover
			}
			result.list.push(comic);
		}
		window.Rulia.endWithResult(result);
	} catch (error) {
		window.Rulia.endWithException(error.message);
	}
}

async function getMangaListByBookshelf(page, pageSize) {
	const url =
		'https://mangacopy.com/api/v3/member/collect/comics';
	try {
		const rawResponse = await window.Rulia.httpRequest({
			url: url,
			method: 'GET',
			payload: 'limit=' + pageSize + '&offset=' + ((page - 1) * pageSize) +
				'&free_type=1&ordering=-datetime_modifier',
			headers: {
				'authorization': authorization,
				'Platform': 2
			}
		});
		const response = JSON.parse(rawResponse);
		let result = {
			list: []
		}
		for (let manga of response.results.list) {
			let comic = {
				title: manga.comic.name,
				url: 'https://www.mangacopy.com/comic/' + manga.comic.path_word,
				coverUrl: manga.comic.cover
			}
			result.list.push(comic);
		}
		window.Rulia.endWithResult(result);
	} catch (error) {
		window.Rulia.endWithException(error.message);
	}
}

async function getMangaListByCategory(page, pageSize, filterOptions) {
	if (filterOptions.theme == 'recommend') {
		return await getMangaListByRecommend(page, pageSize);
	} else if (filterOptions.theme == 'bookshelf') {
		return await getMangaListByBookshelf(page, pageSize);
	} else {
		const url = 'https://www.copy20.com/api/v3/comics';
		try {
			let theme = '';
			let top = '';
			if (filterOptions.theme && filterOptions.theme != 0) {
				theme = '&theme=' + filterOptions.theme;
			}
			if (filterOptions.top && filterOptions.top != 0) {
				top = '&top=' + filterOptions.top;
			}
			let payload = '_update=true&format=json&free_type=1&limit=' + pageSize + '&offset=' + ((page - 1) *
				pageSize) + '&ordering=popular' + theme + top;
			const rawResponse = await window.Rulia.httpRequest({
				url: url,
				method: 'GET',
				payload: payload,
				headers: headers
			})
			const response = JSON.parse(rawResponse);
			let result = {
				list: []
			}
			for (let manga of response.results.list) {
				let comic = {
					title: manga.name,
					url: 'https://www.mangacopy.com/comic/' + manga.path_word,
					coverUrl: manga.cover
				}
				result.list.push(comic);
			}
			window.Rulia.endWithResult(result);
		} catch (error) {
			window.Rulia.endWithException(error.message);
		}
	}
}

async function getMangaListBySearching(page, pageSize, keyword) {
	const url =
		'https://www.copy20.com/api/v3/search/comic';
	try {
		const rawResponse = await window.Rulia.httpRequest({
			url: url,
			method: 'GET',
			payload: '_update=true&format=json&limit=' + pageSize + '&offset=' + ((page - 1) * pageSize) +
				'&platform=1&q=' + keyword + '&q_type=',
			headers: headers
		});
		const response = JSON.parse(rawResponse);
		let result = {
			list: []
		}
		for (let manga of response.results.list) {
			let comic = {
				title: manga.name,
				url: 'https://www.mangacopy.com/comic/' + manga.path_word,
				coverUrl: manga.cover
			}
			result.list.push(comic);
		}
		window.Rulia.endWithResult(result);
	} catch (error) {
		window.Rulia.endWithException(error.message);
	}
}

async function getMangaList(page, pageSize, keyword, rawFilterOptions) {
	if (keyword) {
		return await getMangaListBySearching(page, pageSize, keyword);
	} else {
		return await getMangaListByCategory(page, pageSize, JSON.parse(rawFilterOptions));
	}
}

async function getMangaData(dataPageUrl) {
	const seasonIdMatchExp = /\/comic\/(.*)/;
	const seasonIdMatch = dataPageUrl.match(seasonIdMatchExp);
	const detailUrl = 'https://www.copy20.com/api/v3/comic2/' + seasonIdMatch[1];
	const chapterListUrl = 'https://www.copy20.com/api/v3/comic/' + seasonIdMatch[1] + '/group/default/chapters';
	try {
		const detailRawResponse = await window.Rulia.httpRequest({
			url: detailUrl,
			method: 'GET',
			payload: 'format=json&platform=3',
			headers: headers
		})
		const detailResponse = JSON.parse(detailRawResponse);
		let result = {
			title: detailResponse.results.comic.name,
			description: detailResponse.results.comic.brief,
			coverUrl: detailResponse.results.comic.cover,
			chapterList: []
		}
		const chapterListRawResponse = await window.Rulia.httpRequest({
			url: chapterListUrl,
			method: 'GET',
			payload: '_update=true&format=json&limit=500&offset=0',
			headers: headers
		});
		const chapterListResponse = JSON.parse(chapterListRawResponse);

		for (let manga of chapterListResponse.results.list) {
			let comic = {
				title: '[' + manga.name + '][' + manga.datetime_created + ']',
				url: 'https://www.mangacopy.com/comic/' + seasonIdMatch[1] + '/chapter/' + manga.uuid
			}
			result.chapterList.push(comic);
		}
		window.Rulia.endWithResult(result);
	} catch (error) {
		window.Rulia.endWithException(error.message);
	}
}

async function getChapterImageList(chapterUrl) {
	const episodeIdMatchExp = /https?:\/\/www\.mangacopy\.com\/comic\/([a-zA-Z0-9_-]+)\/chapter\/([0-9a-f-]+)/;
	const episodeIdMatch = chapterUrl.match(episodeIdMatchExp);
	const url = 'https://www.copy20.com/api/v3/comic/' + episodeIdMatch[1] + '/chapter2/' + episodeIdMatch[2];
	const rawResponse = await window.Rulia.httpRequest({
		url: url,
		method: 'GET',
		payload: 'format=json',
		headers: headers
	});
	const response = JSON.parse(rawResponse);
	let result = [];
	for (let i = 0; i < response.results.chapter.words.length; i++) {
		result.push({
			url: response.results.chapter.contents[i].url.replace(/c800x/, 'c1500x'),
			index: response.results.chapter.words[i],
			width: 1,
			height: 1
		});
	}
	result.sort(function(a, b) {
		return a.index - b.index;
	});
	for (let i = 0; i < result.length; i++) {
		delete result[i].index;
	}
	window.Rulia.endWithResult(result);
}

async function getImageUrl(path) {
	window.Rulia.endWithResult(path);
}