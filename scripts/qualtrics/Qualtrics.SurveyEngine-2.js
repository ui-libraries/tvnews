Qualtrics.SurveyEngine.addOnload(function() {
    /* Your code for page load */
});

Qualtrics.SurveyEngine.addOnReady(function() {
    var video_data = [{
		"title": "P 1500 75016",
		"url": "https://www.youtube.com/watch?v=--BAeCHBh18",
		"A": "The ad features a cartoon with different types of individuals endorsing the republican candidate and stating their dislike for the Democratic nominees. The ad emphasizes that everyone likes the candidate and that the people will take him to Washington; therefore, now is the time to vote for the candidate.",
		"B": "The advertisement sings along to a tune of \"Ike for president.\" Cartoon Americans and patriotic images stress the concept that everyone supports this candidate and for what he stands. It is expressed that bringing the candidate to Washington would be an American duty that everyone is fulfilling.",
		"selection": [
			2,
			1
		],
		"embed": "<iframe class=\"youtube-video\"  src=\"https://www.youtube.com/embed/--BAeCHBh18\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>"
	},
	{
		"title": "P 1436 67065",
		"url": "https://www.youtube.com/watch?v=-DCuS2T_iyY",
		"A": "The ad criticizes the candidate for denying that he aided in engineering a 100 billion dollar tax increase. The ad cites a news source that confirms the candidate's role in the budget deal and urges the public to see that the candidate only flipped on the deal to cover himself politically. ",
		"B": "The opposing candidate denies having helped to create a $100 billion tax increase, but his significant role in it has been proved by news sources. The opposing candidate then switched his position and voted against the bill. The opponent is negatively characterized as a \"Washington politician.\"",
		"selection": [
			2,
			1
		],
		"embed": "<iframe class=\"youtube-video\"  src=\"https://www.youtube.com/embed/-DCuS2T_iyY\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>"
	},
	{
		"title": "P 1425 66916",
		"url": "https://www.youtube.com/watch?v=0rhBETx6jgM",
		"A": "A narrator urges the audience to listen to the candidate's message, suggesting it may align with their own beliefs. The candidate then advocates for a robust and strengthened social security system. A slogan affirming the first message of the ad reads: \"In your heart, you know he's right.\"",
		"B": "The advertisement tells viewers to listen and understand that the candidate shares their opinions. The candidate wants a sound and stronger Social Security system. He also wants the dollar to have real purchasing power. It is affirmed that the candidate is right and advised that viewers vote for him.",
		"selection": [
			3,
			2
		],
		"embed": "<iframe class=\"youtube-video\"  src=\"https://www.youtube.com/embed/0rhBETx6jgM\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>"
	}
    ];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function loadVideoData() {
        let shownIndices = JSON.parse(localStorage.getItem('shownVideoIndices')) || [];
        let videosToShow = video_data.filter((_, index) => !shownIndices.includes(index));

        if (videosToShow.length === 0) {
            console.log("All videos have been shown.");
            shownIndices = [];
            videosToShow = video_data;
        }

        shuffleArray(videosToShow);
        const selectedVideo = videosToShow[0];
        const originalIndex = video_data.findIndex(video => video.title === selectedVideo.title);

        shownIndices.push(originalIndex);
        localStorage.setItem('shownVideoIndices', JSON.stringify(shownIndices));

        document.getElementById('ad_video').innerHTML = selectedVideo.embed;
        document.getElementById('summariesContainer').innerHTML = '<div>' + selectedVideo.A + '</div><div>' + selectedVideo.B + '</div>';
    }

    this.questionclick = function(event, element) {
        if (element.type === 'next') {
            event.preventDefault();
            saveAndResetResponses(); // Function to handle response saving and resetting
            loadVideoData();
        }
    };


    // Initial data load
    loadVideoData();
});

Qualtrics.SurveyEngine.addOnUnload(function() {
    /* Your code for page unload */
});
