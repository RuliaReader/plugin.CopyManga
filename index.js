const userConfig = window.Rulia.getUserConfig()

let authorization = false;

if (userConfig.authorization) {
	authorization = userConfig.authorization;
}

async function setMangaListFilterOptions() {
	const url = 'https://api.copy2000.online/api/v3/h5/filter/comic/tags';
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
		}]

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
			headers: {
				'Accept': 'application/json',
				'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
				'Origin': 'https://m.relamanhua.org',
				'Version': '2025.11.21',
				'Webp': '1',
				'platform': '1',
				'Host': 'mapi.hotmangasd.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
			}
		});
		const response = JSON.parse(rawResponse);
		for (let item of response.results.theme) {
			result[0].options.push({
				label: item.name,
				value: item.path_word
			})
		}
		window.Rulia.endWithResult(result);
	} catch (error) {
		window.Rulia.endWithResult([])
	}

}

async function getMangaListBySearching(page, pageSize, keyword) {
	const url =
		'https://mapi.hotmangasd.com/api/v3/search/comic';
	try {
		const rawResponse = await window.Rulia.httpRequest({
			url: url,
			method: 'GET',
			payload: 'limit=' + pageSize + '&offset=' + ((page - 1) * pageSize) +
				'&platform=2&q=' + keyword + '&q_type=',
			headers: {
				'Accept': 'application/json',
				'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
				'Origin': 'https://m.relamanhua.org',
				'Version': '2025.11.21',
				'Webp': '1',
				'platform': '1',
				'Host': 'mapi.hotmangasd.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
			}
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

async function getMangaListByRecommend(page, pageSize) {
	const url =
		'https://mapi.hotmangasd.com/api/v3/recs';
	try {
		const rawResponse = await window.Rulia.httpRequest({
			url: url,
			method: 'GET',
			payload: 'format=json&limit=' + pageSize + '&offset=' + ((page - 1) * pageSize) +
				'&pos=3200102',
			headers: {
				'Accept': 'application/json',
				'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
				'Origin': 'https://m.relamanhua.org',
				'Version': '2025.11.21',
				'Webp': '1',
				'platform': '1',
				'Host': 'mapi.hotmangasd.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
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

async function getMangaListByBookshelf(page, pageSize) {
	const url =
		'https://www.mangacopy.com/api/v3/member/collect/comics';
	try {
		const rawResponse = await window.Rulia.httpRequest({
			url: url,
			method: 'GET',
			payload: 'limit=' + pageSize + '&offset=' + ((page - 1) * pageSize) +
				'&free_type=1&ordering=-datetime_modifier',
			headers: {
				'authorization': authorization,
				'Platform': 2,
				'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,ja;q=0.5',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
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
		const url = 'https://mapi.hotmangasd.com/api/v3/comics';
		try {
			let theme = '';
			if (filterOptions.theme && filterOptions.theme != 0) {
				theme = '&theme=' + filterOptions.theme;
			}
			let payload = '_update=true&format=json&free_type=1&limit=' + pageSize + '&offset=' + ((page - 1) *
				pageSize) + '&ordering=popular' + theme;
			const rawResponse = await window.Rulia.httpRequest({
				url: url,
				method: 'GET',
				payload: payload,
				headers: {
					'Accept': 'application/json',
					'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
					'Origin': 'https://m.relamanhua.org',
					'Version': '2025.11.21',
					'Webp': '1',
					'platform': '1',
					'Host': 'mapi.hotmangasd.com',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
				}
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
	const detailUrl = 'https://mapi.hotmangasd.com/api/v3/comic2/' + seasonIdMatch[1];
	const chapterListUrl = 'https://mapi.hotmangasd.com/api/v3/comic/' + seasonIdMatch[1] +
		'/group/default/chapters';
	try {
		const detailRawResponse = await window.Rulia.httpRequest({
			url: detailUrl,
			method: 'GET',
			payload: 'format=json',
			headers: {
				'Accept': 'application/json',
				'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
				'Origin': 'https://m.relamanhua.org',
				'Version': '2025.11.21',
				'Webp': '1',
				'platform': '1',
				'Host': 'mapi.hotmangasd.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
			}
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
			headers: {
				'Accept': 'application/json',
				'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
				'Origin': 'https://m.relamanhua.org',
				'Version': '2025.11.21',
				'Webp': '1',
				'platform': '1',
				'Host': 'mapi.hotmangasd.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
			}
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
	const url = 'https://mapi.hotmangasd.com/api/v3/comic/' + episodeIdMatch[1] + '/chapter/' + episodeIdMatch[2];
	const rawResponse = await window.Rulia.httpRequest({
		url: url,
		method: 'GET',
		payload: 'format=json',
		headers: {
			'Accept': 'application/json',
			'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
			'Origin': 'https://m.relamanhua.org',
			'Version': '2025.11.21',
			'Webp': '1',
			'platform': '1',
			'Host': 'mapi.hotmangasd.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
		}
	});
	const response = JSON.parse(rawResponse);
	let pageUrls = [];

	for (let item of response.results.chapter.contents) {
		pageUrls.push(item.url)
	}

	const promises = pageUrls.map(url =>
		new Promise(resolve => {
			const img = new Image();
			img.onload = img.onerror = () => {
				resolve({
					url,
					width: img.width,
					height: img.height
				});
			};
			img.src = url;
		})
	);
	const result = await Promise.all(promises);
	window.Rulia.endWithResult(result);
}

async function getImageUrl(path) {
	window.Rulia.endWithResult(path);
}