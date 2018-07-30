const TechHives = artifacts.require("./TechHives.sol");
// let ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
const web3 = global.web3;

const tw = v => web3.toBigNumber(v).mul(1e18);
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

});