async function getMangaListByRecommend(page, pageSize) {
	const url =
		'https://api.mangacopy.com/api/v3/recs';
	try {
		const rawResponse = await window.Rulia.httpRequest({
			url: url,
			method: 'GET',
			payload: 'format=json&limit=' + pageSize + '&offset=' + ((page - 1) * pageSize) + '&pos=3200102'
		});
		const response = JSON.parse(rawResponse);
		var result = {
			list: []
		}
		for (var manga of response.results.list) {
			var comic = {
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

async function getMangaListBySearching(page, pageSize, keyword) {
	const url =
		'https://api.mangacopy.com/api/v3/search/comic';
	try {
		const rawResponse = await window.Rulia.httpRequest({
			url: url,
			method: 'GET',
			payload: '_update=true&format=json&limit=' + pageSize + '&offset=' + ((page - 1) * pageSize) +
				'&platform=1&q=' + keyword + '&q_type='
		});
		const response = JSON.parse(rawResponse);
		var result = {
			list: []
		}
		for (var manga of response.results.list) {
			var comic = {
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

async function getMangaList(page, pageSize, keyword) {
	if (keyword) {
		return await getMangaListBySearching(page, pageSize, keyword);
	} else {
		return await getMangaListByRecommend(page, pageSize);
	}
}

async function getMangaData(dataPageUrl) {
	const seasonIdMatchExp = /\/comic\/(.*)/;
	const seasonIdMatch = dataPageUrl.match(seasonIdMatchExp);
	const detailUrl = 'https://api.mangacopy.com/api/v3/comic2/' + seasonIdMatch[1];
	const chapterListUrl = 'https://api.mangacopy.com/api/v3/comic/' + seasonIdMatch[1] + '/group/default/chapters';
	try {
		const detailRawResponse = await window.Rulia.httpRequest({
			url: detailUrl,
			method: 'GET',
			payload: 'format=json&platform=3'
		})
		const detailResponse = JSON.parse(detailRawResponse);
		var result = {
			title: detailResponse.results.comic.name,
			description: detailResponse.results.comic.brief,
			coverUrl: detailResponse.results.comic.cover,
			chapterList: []
		}
		const chapterListRawResponse = await window.Rulia.httpRequest({
			url: chapterListUrl,
			method: 'GET',
			payload: '_update=true&format=json&limit=500&offset=0'
		});
		const chapterListResponse = JSON.parse(chapterListRawResponse);

		for (var manga of chapterListResponse.results.list) {
			var comic = {
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
	const url = 'https://api.mangacopy.com/api/v3/comic/' + episodeIdMatch[1] + '/chapter2/' + episodeIdMatch[2];

	const rawResponse = await window.Rulia.httpRequest({
		url: url,
		method: 'GET',
		payload: 'format=json'
	});
	const response = JSON.parse(rawResponse);
	var result = [];
	for (var i = 0; i < response.results.chapter.words.length; i++) {
		result.push({
			url: response.results.chapter.contents[i].url,
			index: response.results.chapter.words[i],
			width: 1,
			height: 1
		});
	}
	result.sort(function(a, b) {
		return a.index - b.index;
	});
	for (var i = 0; i < result.length; i++) {
		delete result[i].index;
	}
	window.Rulia.endWithResult(result);
}

async function getImageUrl(path) {
	window.Rulia.endWithResult(path);
}
//