const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
.use(require('chai-as-promised'))
.should()

contract('Decentragram', ([deployer, author, tipper]) => {
	let decentragram

	before(async () => {
		decentragram = await Decentragram.deployed()
	})

	describe('deployment', async () => {
		it('deploys successfully', async () => {
			const address = await decentragram.address
			assert.notEqual(address, 0x0)
			assert.notEqual(address, '')
			assert.notEqual(address, null)
			assert.notEqual(address, undefined)
		})

		it('has a name', async () => {
			const name = await decentragram.name()
			assert.equal(name, 'Decentragram')
		})
	})
			
	describe('images', async () => {
		let result, imageCount;
		const hash = "abc213";

		before(async () => {
			result = await decentragram.uploadImage(hash, 'Image description', {from: author});
			imageCount = await decentragram.imageCount();
		})

		it('creates images', async () => {
			//SUCCESS
			assert.equal(imageCount, 1);
			const event = result.logs[0].args;
			assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct');
			assert.equal(event.hash, hash, 'hash is correct');
			assert.equal(event.description, 'Image description', 'description is correct');
			assert.equal(event.tipAmount.toNumber(), 0, 'tipAmount is correct');
			assert.equal(event.author, author, 'author is correct');

			//FAILURE
			await decentragram.uploadImage('', 'Image description', {from: author}).should.be.rejected;
			await decentragram.uploadImage(hash, '', {from: author}).should.be.rejected;

			//Check struct
			it('lists images', async () => {
				const image = await decentragram.images(imageCount);
				assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct');
				assert.equal(image.hash, hash, 'hash is correct');
				assert.equal(image.description, 'Image description', 'description is correct');
				assert.equal(image.tipAmount, 0, 'tipAmount is correct');
				assert.equal(image.author, author, 'author is correct');
			})
		})

		it('allows users to tip images', async () => {
			let oldAuthorBalance;

			//Fetch old author balance
			oldAuthorBalance = await web3.eth.getBalance(author);
			oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);

			result = await decentragram.tipImageOwner(imageCount, {from: tipper, value: web3.utils.toWei('1', 'Ether')});

			//SUCCESS
			const event = result.logs[0].args;
			assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct');
			assert.equal(event.hash, hash, 'hash is correct');
			assert.equal(event.description, 'Image description', 'description is correct');
			assert.equal(event.tipAmount, 1000000000000000000, 'tipAmount is correct');
			assert.equal(event.author, author, 'author is correct');

			//Fetch new author balance
			let newAuthorBalance;
			newAuthorBalance = await web3.eth.getBalance(author);
			newAuthorBalance = new web3.utils.BN(newAuthorBalance);

			let tippedAmount;
			tippedAmount = web3.utils.toWei('1', 'Ether');
			tippedAmount = new web3.utils.BN(tippedAmount);

			//Check author correctly remunerated
			const expectedBalance = oldAuthorBalance.add(tippedAmount);
			assert.equal(newAuthorBalance.toString(), expectedBalance.toString(), 'Author successfully tipped');

			//FAILURE try tipping a non existing picture
			await decentragram.tipImageOwner(99, {from: author, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
		})
	})
})

