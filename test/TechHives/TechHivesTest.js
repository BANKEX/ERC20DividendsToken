const TechHives = artifacts.require("./TechHives.sol");
// let ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
const web3 = global.web3;

const tw = v => web3.toBigNumber(v).mul(1e18);
const tbn = v => web3.toBigNumber(v);
//const tw = web3._extend.utils.toWei;
const fw = v => web3._extend.utils.fromWei(v).toString();
const gasPrice = tw("3e-7");

contract('TechHives', (accounts) => {

    //initial params for testing

    const CREATOR = accounts[0];
    const TEST_VALUE = tw(100);
    const TEST_ETH_VALUE = tw(2);
    const DECIMAL_MULT = tw(10);

    beforeEach(async () => {
        tech = await TechHives.new({from: CREATOR});
    });

    it("should allow to mint new tokens to owner (creators) and do it only for mintBalance", async () => {
        let supBefore = await tech.totalSupply();
        await tech.mint(CREATOR, TEST_VALUE, {from: CREATOR});
        let supNow = await tech.totalSupply();
        assert((supBefore.plus(TEST_VALUE)).eq(supNow));
        await tech.mint(CREATOR, tw(24900), {from: CREATOR});
        let supNowNow = await tech.totalSupply();
        assert((supNow.plus(tw(24900))).eq(supNowNow));
        try {
            await tech.mint(CREATOR, tw(1), {from: CREATOR});
        }

        catch (e) {

        }
        let supNowNowNow = await tech.totalSupply();
        assert(supNowNow.eq(supNowNowNow));
    });

    it("should calculate dividends correctly for new investors", async () => {
        await tech.mint(CREATOR, TEST_VALUE, {from: CREATOR});
        await tech.acceptDividends(TEST_ETH_VALUE, {from: accounts[1], value: TEST_ETH_VALUE});
        let sumOnInvestorDividends = TEST_ETH_VALUE;
        let contractSumOnInvestorDividends = await tech.dividendsRightsOf(CREATOR);
        assert(contractSumOnInvestorDividends.eq(sumOnInvestorDividends));
    });

    it("should calculate dividends correctly for new investors x2", async () => {
        await tech.mint(CREATOR, TEST_VALUE, {from: CREATOR});

        for (let i = 1; i < 9; i++) {
            await tech.transfer(accounts[i], tw(2), {from: CREATOR});
            assert((tw(2)).eq(await tech.balanceOf(accounts[i])));
        }

        await tech.acceptDividends(TEST_ETH_VALUE, {from: accounts[0], value: TEST_ETH_VALUE});

        let dpertoken = TEST_ETH_VALUE.mul(DECIMAL_MULT).div((TEST_VALUE));
        let awaitableSum = (tw(2)).mul(dpertoken).div(DECIMAL_MULT);

        for (let i = 1; i < 9; i++) {
            let contractSum = await tech.dividendsRightsOf(accounts[i]);
            assert(contractSum.eq(awaitableSum), `${awaitableSum.toString()} ++++++ ${contractSum.toString()}`);
        }

        let balancesBefore = [];
        balancesBefore.push(0);

        let gasUses = [];
        gasUses.push(0);

        for (let i = 1; i < 9; i++) {
            let a = await web3.eth.getBalance(accounts[i]);
            balancesBefore.push(a);
        }

        for (let i = 1; i < 9; i++) {
            let contractSum = await tech.dividendsRightsOf(accounts[i]);
            let instance = await tech.releaseDividendsRights(contractSum, {from: accounts[i], gasPrice: gasPrice});
            let price = gasPrice.mul(instance.receipt.gasUsed);
            gasUses.push(price);
        }

        for (let i = 1; i < 9; i++) {
            let balanceNow = await web3.eth.getBalance(accounts[i]);
            assert((balanceNow.plus(gasUses[i])).eq(balancesBefore[i].plus(awaitableSum)))
        }
    });

    it("should allow send investors their tokens to others and do it correctly", async () => {
        await tech.mint(CREATOR, TEST_VALUE, {from: CREATOR});
        for (let i = 1; i < 9; i++) {
            await tech.transfer(accounts[i], tw(2), {from: CREATOR});
            assert((tw(2)).eq(await tech.balanceOf(accounts[i])));
        }
        await tech.acceptDividends(TEST_ETH_VALUE, {from: accounts[0], value: TEST_ETH_VALUE});
        let dpertoken = TEST_ETH_VALUE.mul(DECIMAL_MULT).div((TEST_VALUE));
        let awaitableSum = (tw(2)).mul(dpertoken).div(DECIMAL_MULT);
        for (let i = 1; i < 9; i++) {
            let contractSum = await tech.dividendsRightsOf(accounts[i]);
            assert(contractSum.eq(awaitableSum), `${awaitableSum.toString()} ++++++ ${contractSum.toString()}`);
        }
        let balancesBefore = [];
        balancesBefore.push(0);
        let gasUses = [];
        gasUses.push(0);
        for (let i = 1; i < 9; i++) {
            let a = await web3.eth.getBalance(accounts[i]);
            balancesBefore.push(a);
        }
        for (let i = 1; i < 9; i++) {
            let contractSum = await tech.dividendsRightsOf(accounts[i]);
            let instance = await tech.releaseDividendsRights(contractSum, {from: accounts[i], gasPrice: gasPrice});
            let price = gasPrice.mul(instance.receipt.gasUsed);
            gasUses.push(price);
        }
        for (let i = 1; i < 9; i++) {
            let balanceNow = await web3.eth.getBalance(accounts[i]);
            assert((balanceNow.plus(gasUses[i])).eq(balancesBefore[i].plus(awaitableSum)));
        }
        for (let i = 1; i < 9; i++) {
            await tech.transfer(accounts[5], tw(1), {from: accounts[i]});
        }
        let bal = await tech.balanceOf(accounts[5]);
        assert(bal.eq(tw(9)), `${bal.toString()}`);
        await tech.acceptDividends(TEST_ETH_VALUE, {from: accounts[8], value: TEST_ETH_VALUE});
        let contractSumOfacc = await tech.dividendsRightsOf(accounts[5]);
        let balB = await web3.eth.getBalance(accounts[5]);
        let instanse = await tech.releaseDividendsRights(contractSumOfacc, {from: accounts[5], gasPrice: gasPrice});
        let priceD = gasPrice.mul(instanse.receipt.gasUsed);
        let balA = await web3.eth.getBalance(accounts[5]);
        assert((balA.plus(priceD)).eq(balB.plus(contractSumOfacc)));
    });

    it("should allow to use transferFrom correctly", async () => {
        await tech.mint(CREATOR, TEST_VALUE, {from: CREATOR});
        for (let i = 1; i < 9; i++) {
            await tech.transfer(accounts[i], tw(2), {from: CREATOR});
            assert((tw(2)).eq(await tech.balanceOf(accounts[i])));
        }
        await tech.approve(accounts[5], tw(2), {from: accounts[4]});
        await tech.transferFrom(accounts[4], accounts[5], tw(2), {from: accounts[5]});
        assert((await tech.balanceOf(accounts[4])).eq(tw(0)));
        assert((await tech.balanceOf(accounts[5])).eq(tw(4)));
        await tech.acceptDividends(TEST_ETH_VALUE, {from: accounts[3], value: TEST_ETH_VALUE});
        let contractSumOfacc = await tech.dividendsRightsOf(accounts[5]);
        let balB = await web3.eth.getBalance(accounts[5]);
        let instanse = await tech.releaseDividendsRights(contractSumOfacc, {from: accounts[5], gasPrice: gasPrice});
        let priceD = gasPrice.mul(instanse.receipt.gasUsed);
        let balA = await web3.eth.getBalance(accounts[5]);
        assert((balA.plus(priceD)).eq(balB.plus(contractSumOfacc)));
    });

    it("should allow to accept dividends and mint multiple times correctly", async () => {
        await tech.mint(CREATOR, TEST_VALUE, {from: CREATOR});
        await tech.transfer(accounts[1], tw(1), {from: CREATOR});
        await tech.acceptDividends(TEST_ETH_VALUE, {from: CREATOR, value: TEST_ETH_VALUE});
        let total = await tech.totalSupply();
        let k = tw(1).div(total);
        let awSum = k.mul(TEST_ETH_VALUE);
        assert(awSum.eq(await tech.dividendsRightsOf(accounts[1])));
        await tech.mint(CREATOR, tw(10), {from: CREATOR});
        await tech.acceptDividends(tw(12), {from: CREATOR, value: tw(12)});
        let newTotal = await tech.totalSupply();
        let newK = tw(1).div(newTotal);
        let NewSum = (tw(12).mul(newK)).plus(awSum);
        NewSum = NewSum.toString();
        NewSum = NewSum.substring(0, NewSum.length - 1);
        NewSum = tbn(NewSum);
        assert(NewSum.eq(await tech.dividendsRightsOf(accounts[1])), `${NewSum.toString()} +++ ${(await tech.dividendsRightsOf(accounts[1])).toString()}`);
    });
});