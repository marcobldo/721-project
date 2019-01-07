import 'babel-polyfill';
const StarNotary = artifacts.require('./starNotary.sol')

var instance;
var mathUtil;

let accounts;

contract('StarNotary', async (accs) => {
    accounts = accs;
    instance = await StarNotary.deployed();
});

it('can read Token name', async () => {
    instance = await StarNotary.deployed();
    assert.equal(await instance.tokenName.call(), 'StardustToken');
});

it('can read Token symbol', async () => {
    instance = await StarNotary.deployed();
    assert.equal(await instance.symbol.call(), 'SDT');
});


it('can Create a Star', async () => {
    let tokenId = 1;
    instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
    let user1 = accounts[1]
    let starId = 2;
    //let starPrice = web3.utils.toWei('.01', "ether")
    let starPrice = web3.toWei('.01', "ether")
    await instance.createStar('awesome star', starId, { from: user1 })
    await instance.putStarUpForSale(starId, starPrice, { from: user1 })
    assert.equal(await instance.starsForSale.call(starId), starPrice)
});

it('lets user1 get the funds after the sale', async () => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 3
    //let starPrice = web3.utils.toWei('.01', "ether")
    let starPrice = web3.toWei('.01', "ether")
    await instance.createStar('awesome star', starId, { from: user1 })
    await instance.putStarUpForSale(starId, starPrice, { from: user1 })
    var balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1)

    await instance.buyStar(starId, { from: user2, value: starPrice })
    var balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1)
    
    //let starWeiPrice = web3.utils.toWei(starPrice.toString(), 'wei')
    let starWeiPrice = web3.toWei(starPrice.toString(), 'wei')
    let sum = web3.utils.toBN(balanceOfUser1BeforeTransaction).add(web3.utils.toBN(starWeiPrice)).toString();
    assert.equal(sum, balanceOfUser1AfterTransaction);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 4
    //let starPrice = web3.utils.toWei('.01', "ether")
    let starPrice = web3.toWei('.01', "ether")
    await instance.createStar('awesome star', starId, { from: user1 })
    await instance.putStarUpForSale(starId, starPrice, { from: user1 })
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, { from: user2, value: starPrice })
    assert.equal(await instance.ownerOf.call(starId), user2)
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 5
    //let starPrice = web3.utils.toWei('.01', "ether")
    let starPrice = web3.toWei('.01', "ether")
    await instance.createStar('awesome star', starId, { from: user1 })
    await instance.putStarUpForSale(starId, starPrice, { from: user1 })
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2)
    var balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2)
    await instance.buyStar(starId, { from: user2, value: starPrice, gasPrice: 0 })
    var balanceAfterUser2BuysStar = await web3.eth.getBalance(user2)

    let sub = web3.utils.toBN(balanceOfUser2BeforeTransaction).sub(web3.utils.toBN(balanceAfterUser2BuysStar)).toString();
    //console.log(sub)
    assert.equal(sub, starPrice)
});


it('can an user exchanges their stars', async () => {
    let user1StarId = 1010;
    let user2StarId = 2020;
    instance = await StarNotary.deployed()
    await instance.createStar('Awesome Star1!', user1StarId, { from: accounts[0] })
    await instance.createStar('Awesome Star2!', user2StarId, { from: accounts[1] })
    let addressUser1 = await instance.ownerOf.call(user1StarId);
    let addressUser2 = await instance.ownerOf.call(user2StarId);
    await instance.exchangeStars(addressUser1, addressUser2, user1StarId, user2StarId)
    let transferAddres = await instance.ownerOf.call(user1StarId);
    assert.equal(addressUser2, transferAddres)
});


it('can an user transfer one star', async () => {
    let user1StarId = 111;
    let user2StarId = 222;
    instance = await StarNotary.deployed()
    await instance.createStar('Awesome Star1!', user1StarId, { from: accounts[0] })
    await instance.createStar('Awesome Star2!', user2StarId, { from: accounts[1] })
    let addressUser1 = await instance.ownerOf.call(user1StarId);
    let addressUser2 = await instance.ownerOf.call(user2StarId);
    await instance.transferStar(addressUser1, addressUser2, user1StarId, { from: accounts[0] })
    let transferAddres = await instance.ownerOf.call(user1StarId);
    assert.equal(addressUser2, transferAddres)

});

it('look up a Star using a tokenID', async () => {
    let user1StarId = 44834836;
    instance = await StarNotary.deployed()
    await instance.createStar('Awesome Star1!', user1StarId, { from: accounts[0] })
    let nameResult = await instance.lookUptokenIdToStarInfo(user1StarId)
    assert.equal(nameResult, 'Awesome Star1!')
});