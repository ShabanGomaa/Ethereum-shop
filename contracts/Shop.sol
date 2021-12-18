// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

contract Shop {
    string public shopName;
    uint256 public count = 0;

    constructor() {
        shopName = "The shop";
    }

    struct Product {
        uint256 id;
        string name;
        string description;
        bool sold;
        address payable owner;
        uint256 price;
    }

    event CreateProduct(
        uint256 id,
        string name,
        string description,
        bool sold,
        address payable owner,
        uint256 price
    );

    event PurchasedProduct(
        uint256 id,
        string name,
        string description,
        bool sold,
        address payable owner,
        uint256 price
    );

    mapping(uint256 => Product) public shopProducts;

    function createShopProduct(
        string memory name,
        uint256 price,
        string memory description
    ) public {
        require(price > 0, "The price should be greater than 0");
        require(bytes(name).length > 0, "The product name should have a value");
        count++;
        shopProducts[count] = Product(
            count,
            name,
            description,
            false,
            payable(msg.sender),
            price
        );

        emit CreateProduct(
            count,
            name,
            description,
            false,
            payable(msg.sender),
            price
        );
    }

    function PurchasedShopProduct(uint256 _id) public payable {
        Product memory singleProduct = shopProducts[_id];
        address payable seller = singleProduct.owner;

        require(seller != msg.sender, "Can't buy your products");
        require(
            msg.value >= singleProduct.price,
            "The value should equal or greater than product price"
        );
        require(
            singleProduct.id > 0 && singleProduct.id <= count,
            "Not valid id"
        );
        require(!singleProduct.sold, "Sold item");

        singleProduct.owner = payable(msg.sender);
        singleProduct.sold = true;
        shopProducts[_id] = singleProduct;
        payable(seller).transfer(msg.value);
        emit PurchasedProduct(
            _id,
            singleProduct.name,
            singleProduct.description,
            true,
            payable(msg.sender),
            singleProduct.price
        );
    }
}
