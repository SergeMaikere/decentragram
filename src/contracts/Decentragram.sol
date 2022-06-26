pragma solidity ^0.5.0;

contract Decentragram {

	string public name =  "Decentragram";

	//Store images
	uint public imageCount = 0;
	mapping ( uint => Image ) public images;

	struct Image {
		uint id;
		string hash;
		string description;
		uint tipAmount;
		address payable author;
	}

	event ImageCreated(
		uint id,
		string hash,
		string description,
		uint tipAmount,
		address payable author
	);

	event ImageTipped(
		uint id,
		string hash,
		string description,
		uint tipAmount,
		address payable author
	);

	//Make sure the image exists
	modifier onlyRealImages (string memory _hash) {
		require(bytes(_hash).length > 0);
		_;
	}

	//Make sure the description exists
	modifier onlyRealDescriptions (string memory _description) {
		require(bytes(_description).length > 0);
		_;
	}

	//Make sure the uploader address exists
	modifier onlyRealUploader () {
		require(msg.sender != address(0x0));
		_;
	}

	//Make sure image to be tipped exists
	modifier onlyRealImageCanBeTipped (uint _id) {
		require(_id > 0 && _id <= imageCount);
		_;
	}

	//Create Images
	function uploadImage (string memory _imageHash, string memory _description) public onlyRealUploader() onlyRealDescriptions(_description) onlyRealImages(_imageHash) {

		//Increment imageCount
		imageCount++;

		//Add image to contract
		images[imageCount] = Image(imageCount, _imageHash, _description, 0, msg.sender);

		//Trigger an event
		emit ImageCreated(imageCount, _imageHash, _description, 0, msg.sender);
	}

	//Tip Images
	function tipImageOwner(uint _id) public payable onlyRealImageCanBeTipped(_id) {
		//Fetch image
		Image memory image = images[_id];

		//Fetch the author
		address payable author = image.author;

		//Pay the author
		author.transfer(msg.value);

		//Increment the tipAmount
		image.tipAmount = image.tipAmount + msg.value;

		//Update the image
		images[_id] = image;

		//Trigger an event
		emit ImageTipped(_id, image.hash, image.description, image.tipAmount, author);
	}
}
