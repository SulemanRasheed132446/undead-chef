const { time, loadFixture }  = require("@nomicfoundation/hardhat-network-helpers") ;
const { anyValue }  = require("@nomicfoundation/hardhat-chai-matchers/withArgs") ;
const { expect }  = require( "chai");
const { ethers }  = require("hardhat") ;
const { MerkleTree }  = require("merkletreejs") ;
const keccak256  = require("keccak256") ;
describe("", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployUndeadChefFixture() {


    // Contracts are deployed using the first signer/account by default
    const [owner, ...otherAccount] = await ethers.getSigners();

    const UndeadChefContract = await ethers.getContractFactory("UndeadChef");
    const UndeadChef = await UndeadChefContract.deploy("Savage Nation", "Savage", "https://savage.com/");
    let Sale = {
      PAUSED: 0,
      PRIVATE: 1,
      PRIVATE_NEXT: 2,
      PUBLIC: 3
    }
    return { owner, nonOwners: otherAccount, UndeadChef, Sale };
  }



  describe("Owner Methods", function () {

    describe("setWhitelistPrice", function () {
      it("owner should be able to set", async function () {
        const { owner, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        const oldPrice = ethers.parseEther("0.005");
        expect((await UndeadChef.whitelistPrice()).toString()).to.eq(oldPrice.toString());
        const latestPrice = ethers.parseEther("0.1");
        await UndeadChef.setWhitelistPrice(latestPrice);
        expect((await UndeadChef.whitelistPrice()).toString()).to.eq(latestPrice.toString());
      })

      it("non-owner should not be able to set", async function () {
        const { owner, nonOwners, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        const oldPrice = ethers.parseEther("0.005");
        expect((await UndeadChef.whitelistPrice()).toString()).to.eq(oldPrice.toString());
        const latestPrice = ethers.parseEther("0.1");
        await expect(UndeadChef.connect(nonOwners[0]).setWhitelistPrice(latestPrice)).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
      })
    });

    describe("setPublicPrice", function () {
      it("owner should be able to set", async function () {
        const { owner, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        const oldPrice = ethers.parseEther("0.0033");
        expect((await UndeadChef.publicPrice()).toString()).to.eq(oldPrice.toString());
        const latestPrice = ethers.parseEther("0.1");
        await UndeadChef.setPublicPrice(latestPrice);
        expect((await UndeadChef.publicPrice()).toString()).to.eq(latestPrice.toString());
      })

      it("non-owner should not be able to set", async function () {
        const { owner, nonOwners, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        const oldPrice = ethers.parseEther("0.0033");
        expect((await UndeadChef.publicPrice()).toString()).to.eq(oldPrice.toString());
        const latestPrice = ethers.parseEther("0.1");
        await expect(UndeadChef.connect(nonOwners[0]).setPublicPrice(latestPrice)).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
      })
    });

    describe("setMintsPerWhitelist", function () {
      it("owner should be able to set", async function () {
        const { owner, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        expect(ethers.toNumber((await UndeadChef.maxPerWhitelist()))).to.eq(3);
        const latestMaxMints = 4
        await UndeadChef.setMintsPerWhitelist(latestMaxMints);
        expect(ethers.toNumber((await UndeadChef.maxPerWhitelist()))).to.eq(latestMaxMints);
      })

      it("non-owner should not be able to set", async function () {
        const { owner, nonOwners, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        expect(ethers.toNumber((await UndeadChef.maxPerWhitelist()))).to.eq(3);
        const latestMaxMints = 4
        await expect(UndeadChef.connect(nonOwners[0]).setMintsPerWhitelist(latestMaxMints)).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
      })
    });

    describe("setMintsPerPublic", function () {
      it("owner should be able to set", async function () {
        const { owner, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        expect(ethers.toNumber((await UndeadChef.maxPerPublic()))).to.eq(3);
        const latestMaxMints = 4
        await UndeadChef.setMintsPerPublic(latestMaxMints);
        expect(ethers.toNumber((await UndeadChef.maxPerPublic()))).to.eq(latestMaxMints);
      })

      it("non-owner should not be able to set", async function () {
        const { owner, nonOwners, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        expect(ethers.toNumber((await UndeadChef.maxPerPublic()))).to.eq(3);
        const latestMaxMints = 4
        await expect(UndeadChef.connect(nonOwners[0]).setMintsPerPublic(latestMaxMints)).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
      })
    });

    describe("setMaxSupply", function () {
      it("owner should be able to set", async function () {
        const { owner, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        expect(ethers.toNumber((await UndeadChef.maxSupply()))).to.eq(4000);
        const newSupply = 1500
        await UndeadChef.setMaxSupply(newSupply);
        expect(ethers.toNumber((await UndeadChef.maxSupply()))).to.eq(newSupply);
      })

      it("non-owner should not be able to set", async function () {
        const { owner, nonOwners, UndeadChef } = await loadFixture(deployUndeadChefFixture)
        expect(ethers.toNumber((await UndeadChef.maxSupply()))).to.eq(4000);
        const newSupply = 4
        await expect(UndeadChef.connect(nonOwners[0]).setMaxSupply(newSupply)).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
      })
    });


    describe("setWhitelistRoot", function () {
      it("owner should be able to set", async function () {
        const { UndeadChef } = await loadFixture(deployUndeadChefFixture)
        await UndeadChef.setWhitelistRoot(ethers.encodeBytes32String("whitelistMerkleRoot"));
      })

      it("non-owner should not be able to set", async function () {
        const { UndeadChef, nonOwners } = await loadFixture(deployUndeadChefFixture)
        await expect(UndeadChef.connect(nonOwners[0]).setWhitelistRoot(ethers.encodeBytes32String("whitelistMerkleRoot"))).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
      })
    });

    describe("setBaseURI", function () {
      it("owner should be able to set", async function () {
        const { UndeadChef } = await loadFixture(deployUndeadChefFixture)
        await UndeadChef.setBaseURI("base_uri");

      })

      it("non-owner should not be able to set", async function () {
        const { UndeadChef, nonOwners } = await loadFixture(deployUndeadChefFixture);
        await expect(UndeadChef.connect(nonOwners[0]).setBaseURI("base_uri")).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
      })
    });

    describe("setSaleState", function () {
      it("state is paused by default", async function () {
        const { UndeadChef, Sale } = await loadFixture(deployUndeadChefFixture)
        expect(await UndeadChef.saleState()).to.eq(Sale.PAUSED);
      })

      it("owner can set state to private", async function () {
        const { UndeadChef, nonOwners, Sale } = await loadFixture(deployUndeadChefFixture);
        expect(await UndeadChef.saleState()).to.eq(Sale.PAUSED);
        await UndeadChef.setSaleState(Sale.PRIVATE);
        expect(await UndeadChef.saleState()).to.eq(Sale.PRIVATE);
      })

      it("owner can set state to public", async function () {
        const { UndeadChef, nonOwners, Sale } = await loadFixture(deployUndeadChefFixture);
        expect(await UndeadChef.saleState()).to.eq(Sale.PAUSED);
        await UndeadChef.setSaleState(Sale.PUBLIC);
        expect(await UndeadChef.saleState()).to.eq(Sale.PUBLIC);
      })

      it("non-owner can not set state to anything", async function () {
        const { UndeadChef, nonOwners, Sale } = await loadFixture(deployUndeadChefFixture);
        expect(await UndeadChef.saleState()).to.eq(Sale.PAUSED);
        await expect(UndeadChef.connect(nonOwners[0]).setSaleState(Sale.PRIVATE)).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
        await expect(UndeadChef.connect(nonOwners[0]).setSaleState(Sale.PUBLIC)).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
        await expect(UndeadChef.connect(nonOwners[0]).setSaleState(Sale.PAUSED)).to.be.rejectedWith(`IERC173_NOT_OWNER("${nonOwners[0].address}")`);
      })
    });






  });
  describe("Minting Methods", function () {
    describe("mintWhitelist", function () {
      it("should not mint if saleState is not private", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)
        let whitelistAddresses = nonOwners.map(({ address }) => address);
        const leafNodes = whitelistAddresses.map(address => keccak256(address));
        const merkletree = new MerkleTree(leafNodes, keccak256, {
          sortPairs: true
        })
        const root = merkletree.getHexRoot();
        await UndeadChef.setWhitelistRoot(root);
        const proof = merkletree.getHexProof(leafNodes[0]);
        await expect(UndeadChef.connect(nonOwners[0]).mintWhitelist(proof)).to.be.rejectedWith("Sale not active");
        await UndeadChef.setSaleState(Sale.PUBLIC);
        await expect(UndeadChef.connect(nonOwners[0]).mintWhitelist(proof)).to.be.rejectedWith("Sale not active");
      })


      it("should not be able to  mint if not whitelisted", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)
        let whitelistAddresses = nonOwners.map(({ address }) => address);
        const leafNodes = whitelistAddresses.map(address => keccak256(address));
        const merkletree = new MerkleTree(leafNodes, keccak256, {
          sortPairs: true
        })
        const root = merkletree.getHexRoot();
        await UndeadChef.setWhitelistRoot(root);
        const proof = merkletree.getHexProof(leafNodes[0]);
        const whitelistPrice = await UndeadChef.whitelistPrice();
        await UndeadChef.setSaleState(Sale.PRIVATE);
        await expect(UndeadChef.mintWhitelist(proof, {
          value: whitelistPrice
        })).to.be.rejectedWith(`Whitelist_FORBIDDEN("${owner.address}")`);
      })

      it("should not be able to  mint more than whitelisted for", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)
        let whitelistAddresses = nonOwners.map(({ address }) => address);
        const leafNodes = whitelistAddresses.map(address => keccak256(address));
        const merkletree = new MerkleTree(leafNodes, keccak256, {
          sortPairs: true
        })
        const root = merkletree.getHexRoot();
        await UndeadChef.setWhitelistRoot(root);
        const proof = merkletree.getHexProof(leafNodes[0]);
        const whitelistPrice = await UndeadChef.whitelistPrice();
        await expect(UndeadChef.connect(nonOwners[0]).mintWhitelist(proof)).to.be.rejectedWith("Sale not active");
        await UndeadChef.setSaleState(Sale.PRIVATE);
        await UndeadChef.connect(nonOwners[0]).mintWhitelist(proof, {
          value: whitelistPrice
        })
        expect(await UndeadChef.totalSupply()).eq(3);
        await expect(UndeadChef.connect(nonOwners[0]).mintWhitelist(proof, {
          value: whitelistPrice
        })).to.be.rejectedWith(`Whitelist_CONSUMED("${nonOwners[0].address}")`);
      })


      it("should not mint if the ether sent is not correct", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)
        let whitelistAddresses = nonOwners.map(({ address }) => address);
        const leafNodes = whitelistAddresses.map(address => keccak256(address));
        const merkletree = new MerkleTree(leafNodes, keccak256, {
          sortPairs: true
        })
        const root = merkletree.getHexRoot();
        await UndeadChef.setWhitelistRoot(root);
        const proof = merkletree.getHexProof(leafNodes[0]);
        const whitelistPrice = ethers.parseEther("0.05");
        await UndeadChef.setSaleState(Sale.PRIVATE);
        await expect(UndeadChef.connect(nonOwners[0]).mintWhitelist(proof, {
          value: whitelistPrice
        })).to.be.rejectedWith(`Ether sent is not correct`);
      })




      it("should not be able to  exceed the max supply", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)
        let whitelistAddresses = nonOwners.map(({ address }) => address);
        const leafNodes = whitelistAddresses.map(address => keccak256(address));
        const mintLeafNodes = leafNodes.slice(0, leafNodes.length - 1)
        const merkletree = new MerkleTree(leafNodes, keccak256, {
          sortPairs: true
        })
        const NEW_SUPPLY = (leafNodes.length- 1)* 3
        await UndeadChef.setMaxSupply(NEW_SUPPLY);
        const root = merkletree.getHexRoot();
        await UndeadChef.setSaleState(Sale.PRIVATE);
        await UndeadChef.setWhitelistRoot(root);
        const whitelistPrice = await UndeadChef.whitelistPrice();

        await Promise.all(mintLeafNodes.map(async (node, index) => {
          const proof = merkletree.getHexProof(node);
          await UndeadChef.connect(nonOwners[index]).mintWhitelist(proof, {
            value: whitelistPrice
          })
        }))
      
        const proof = merkletree.getHexProof(leafNodes[leafNodes.length -1]);
        await expect(UndeadChef.connect(nonOwners[nonOwners.length -1]).mintWhitelist(proof, {
          value: whitelistPrice
        })).to.be.rejectedWith(`Exceeds supply`);
        expect(await UndeadChef.totalSupply()).to.eq(NEW_SUPPLY)
      })

      it("should be able to  mint if saleState is private", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)
        let whitelistAddresses = nonOwners.map(({ address }) => address);
        const leafNodes = whitelistAddresses.map(address => keccak256(address));
        const merkletree = new MerkleTree(leafNodes, keccak256, {
          sortPairs: true
        })
        const root = merkletree.getHexRoot();
        await UndeadChef.setWhitelistRoot(root);
        const proof = merkletree.getHexProof(leafNodes[0]);
        const whitelistPrice = await UndeadChef.whitelistPrice();
        await expect(UndeadChef.connect(nonOwners[0]).mintWhitelist(proof)).to.be.rejectedWith("Sale not active");
        await UndeadChef.setSaleState(Sale.PRIVATE);
        await UndeadChef.connect(nonOwners[0]).mintWhitelist(proof, {
          value: whitelistPrice
        })
        expect(await UndeadChef.totalSupply()).eq(3);
        expect(await UndeadChef.tokenURI(1)).eq("https://savage.com/1")
      })
    });


    describe("mintPublic", function () {
      it("should not mint if saleState is not public", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)

        await expect(UndeadChef.connect(nonOwners[0]).mintPublic(2)).to.be.rejectedWith("Sale not active");
        await UndeadChef.setSaleState(Sale.PRIVATE);
        await expect(UndeadChef.connect(nonOwners[0]).mintPublic(2)).to.be.rejectedWith("Sale not active");
      })

      it("should not be able to  mint more than allowed for public", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)
        const publicPrice = await UndeadChef.publicPrice();
        await expect(UndeadChef.connect(nonOwners[0]).mintPublic(2)).to.be.rejectedWith("Sale not active");
        await UndeadChef.setSaleState(Sale.PUBLIC);
        await UndeadChef.connect(nonOwners[0]).mintPublic(3, {
          value: publicPrice * 3n
        })
        expect(await UndeadChef.totalSupply()).eq(3);
        await expect(UndeadChef.connect(nonOwners[0]).mintPublic(1, {
          value: publicPrice
        })).to.be.rejectedWith(`Exceeds mint per wallet`);
      })

      it("should not mint if the ether sent is not correct", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)
        const publicPrice = await UndeadChef.publicPrice();
        await UndeadChef.setSaleState(Sale.PUBLIC);
        await expect(UndeadChef.connect(nonOwners[0]).mintPublic(2, {
          value: publicPrice
        })).to.be.rejectedWith(`Ether sent is not correct`);
      })

      it("should not be able to  exceed the max supply", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)

        await UndeadChef.setMaxSupply(nonOwners.length);
        const publicPrice = await UndeadChef.publicPrice();
        await UndeadChef.setSaleState(Sale.PUBLIC);

        await Promise.all(nonOwners.map(async (nonOwner, index) => {
          await UndeadChef.connect(nonOwner).mintPublic(1, {
            value: publicPrice
          })
        }))
        await expect(UndeadChef.connect(nonOwners[0]).mintPublic(1, {
          value: publicPrice
        })).to.be.rejectedWith(`Exceeds supply`);
        expect(await UndeadChef.totalSupply()).to.eq(nonOwners.length)
      })

      it("should be able to mint if saleState is public", async function () {
        const { UndeadChef, Sale, nonOwners, owner } = await loadFixture(deployUndeadChefFixture)
        await UndeadChef.setMaxSupply(nonOwners.length);
        const publicPrice = await UndeadChef.publicPrice();
        await UndeadChef.setSaleState(Sale.PUBLIC);
        await UndeadChef.connect(nonOwners[0]).mintPublic(3, {
          value: publicPrice *  3n
        })
      })
    });
  })


});
