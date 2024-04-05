Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/

});

Qualtrics.SurveyEngine.addOnReady(function()
{
	// Initialize data index and your JSON data
    var currentIndex = 0;
    var data = [{
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

    function loadData() {
        if (currentIndex < data.length) {
            // Load your data into the question
            // For example, update video URL and summary text based on `data[currentIndex]`
            console.log("Loading data for index: " + currentIndex);
            // Update the question content here using data[currentIndex]

            currentIndex++;
        } else {
            // No more data to load, allow survey to end
            console.log("No more data to load");
            this.clickNextButton = originalNextButtonFunction; // Reset to the original function to allow survey to proceed
        }
    }

    // Save the original next button function
    var originalNextButtonFunction = this.clickNextButton;

    // Override the next button to load new data instead of submitting
    this.clickNextButton = function(event) {
        if (event) event.preventDefault(); // Prevent the survey from proceeding (this line may need adjustment for compatibility)
        loadData.call(this); // Load the next set of data, ensuring 'this' is correctly bound
        // Note: Adjust logic to ensure the survey can eventually be submitted or ended.
    };

    // Load the initial set of data
    loadData.call(this);

});

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/

});