pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    string public constant tokenName = "StardustToken";
    string public constant symbol = "SDT";

    struct Star {
        string name;
    } 

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, uint256 _tokenId) public {
        Star memory newStar;
        newStar.name = _name;
        tokenIdToStarInfo[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
    }


    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);
        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);
        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        starOwner.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (string) {
        require(_tokenId > 0);
        Star memory newStar;
        newStar = tokenIdToStarInfo[_tokenId];
        require(bytes(newStar.name).length  > 0);
        return newStar.name; 
    }

    function exchangeStars(address user1Address, address user2Address, uint256 user1StarId, uint256 user2StarId) public {
        require(this.ownerOf(user1StarId) == user1Address);
        require(this.ownerOf(user2StarId) == user2Address);
        require(user1Address != user2Address);
        require(user2StarId != user1StarId);
/*
        Star memory newStar1;
        Star memory newStar2;
        newStar1.name = lookUptokenIdToStarInfo(user1StarId);
        newStar2.name = lookUptokenIdToStarInfo(user2StarId);
  */      
        _removeTokenFrom(user1Address, user1StarId);
        _removeTokenFrom(user2Address, user2StarId);
        _addTokenTo(user2Address, user1StarId);
        _addTokenTo(user1Address, user2StarId);

    }

    function transferStar(address addressFrom, address addressTo,uint256 _tokenId) public {
        require(this.ownerOf(_tokenId) == msg.sender);
        safeTransferFrom(addressFrom, addressTo, _tokenId);
    }

}