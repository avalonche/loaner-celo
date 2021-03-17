// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/ICommunity.sol";
import "./interfaces/ICommunityFactory.sol";
import "./interfaces/ILoanFactory.sol";
import "./interfaces/ILoanerPool.sol";
import "./interfaces/ILoanerPoolFactory.sol";

/**
 * @notice Welcome to Loaner, the main contract. This is an
 * administrative (for now) contract where the admins have control
 * over the list of communities. Being only able to add and
 * remove communities and manage their loan pools
 */
contract Loaner is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(bytes32 => address[]) public pendingValidations;
    mapping(address => bool) public communities;
    mapping(address => bool) public pools;
    address public cUSDAddress;
    address public moolaAddressProvider;
    address public communityFactory;
    address public loanFactory;
    address public loanerPoolFactory;
    uint256 public signaturesThreshold;

    event CommunityAdded(
        address indexed _communityAddress,
        address indexed _firstManager
    );
    event CommunityRemoved(address indexed _communityAddress);
    event CommunityMigrated(
        address indexed _firstManager,
        address indexed _communityAddress,
        address indexed _previousCommunityAddress
    );
    event PoolAdded(
        address indexed _pool,
        address indexed _communityAddress,
        address indexed _fundsManager
    );
    event CommunityFactoryChanged(address indexed _newCommunityFactory);
    event LoanFactoryChanged(address indexed _newLoanFactory);
    event PoolFactoryChanged(address indexed _newPoolFactory);

    /**
     * @dev It sets the first admin, which later can add others
     * and add/remove communities.
     */
    constructor(address _cUSDAddress, address _moolaAdressProvider, address[] memory _signatures) public {
        require(_signatures.length > 0, "Loaner: Not sufficient signatures");
        _setupRole(ADMIN_ROLE, address(_signatures[0]));
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        cUSDAddress = _cUSDAddress;
        moolaAddressProvider = _moolaAdressProvider;
        if (_signatures.length > 2) {
            signaturesThreshold = _signatures.length - 1;
        } else {
            signaturesThreshold = _signatures.length;
        }
        for (uint8 u = 1; u < _signatures.length; u += 1) {
            _setupRole(ADMIN_ROLE, address(_signatures[u]));
        }
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Loaner: NOT_ADMIN");
        _;
    }

    modifier validateRequest(bytes32 _type, bytes memory _packedParams) {
        bytes32 requestIdentifier = keccak256(
            abi.encodePacked(_type, _packedParams)
        );
        address[] memory validations = pendingValidations[requestIdentifier];
        for (uint8 u = 0; u < validations.length; u += 1) {
            require(validations[u] != msg.sender, "SIGNED");
        }
        pendingValidations[requestIdentifier].push(msg.sender);
        uint256 totalValidations = pendingValidations[requestIdentifier].length;
        if (totalValidations == signaturesThreshold) {
            delete pendingValidations[requestIdentifier];
            _;
        }
    }

    /**
     * @dev Add a new community. Can be used only by an admin.
     * For further information regarding each parameter, see
     * *Community* smart contract constructor.
     */
    function addCommunity(
        address _firstManager
    )
        external
        onlyAdmin
        validateRequest(
            "addCommunity",
            abi.encodePacked(_firstManager)
        )
    {
        address community = ICommunityFactory(communityFactory).deployCommunity(
            _firstManager,
            address(0)
        );
        require(community != address(0), "NOT_VALID");
        communities[community] = true;
        emit CommunityAdded(
            community,
            _firstManager
        );
    }

    /**
     * @dev Migrate community by deploying a new contract. Can be used only by an admin.
     * For further information regarding each parameter, see
     * *Community* smart contract constructor.
     */
    function migrateCommunity(
        address _firstManager,
        address _previousCommunityAddress,
        address _newCommunityFactory
    )
        external
        onlyAdmin
        validateRequest(
            "migrateCommunity",
            abi.encodePacked(_firstManager, _previousCommunityAddress)
        )
    {
        communities[_previousCommunityAddress] = false;
        require(address(_previousCommunityAddress) != address(0), "NOT_VALID");
        ICommunity previousCommunity = ICommunity(_previousCommunityAddress);
        address community = ICommunityFactory(_newCommunityFactory).deployCommunity(
            _firstManager,
            _previousCommunityAddress
        );
        require(community != address(0), "NOT_VALID");
        previousCommunity.migrateFunds(community, _firstManager);
        communities[community] = true;
        emit CommunityMigrated(
            _firstManager,
            community,
            _previousCommunityAddress
        );
    }

    /**
     * @dev Remove an existing community. Can be used only by an admin.
     */
    function removeCommunity(address _community)
        external
        onlyAdmin
        validateRequest("removeCommunity", abi.encodePacked(_community))
    {
        communities[_community] = false;
        emit CommunityRemoved(_community);
    }

    /**
     * @dev Add a pool to the community
     */
    function addPool(address _community, address _fundsManager) 
        external
        onlyAdmin
        validateRequest(
            "addPool",
            abi.encodePacked(
                _community,
                _fundsManager
            )
        )
    {
        require(communities[_community], "Loaner: Need to add pool to existing community by Loaner");
        address pool = ILoanerPoolFactory(loanerPoolFactory).deployPool(
            _fundsManager,
            _community
        );
        require(pool != address(0), "NOT_VALID");
        pools[address(pool)] = true;
        emit PoolAdded(
            pool,
            _community,
            _fundsManager
        );
    }

    /**
     * @dev Set a new community for the fund pool if a community has migrated
     */
    function setPoolCommunity(address _pool, address _newCommunity)
        external
        onlyAdmin
        validateRequest("setPoolCommunity", abi.encodePacked(_pool, _newCommunity))
    {
        require(pools[_pool], "Loaner: Pool was not created from the pool factory");
        ILoanerPool pool = ILoanerPool(_pool);
        pool.setCommunity(_newCommunity);
    }

    /**
     * @dev Set up a new funds manager for a community pool
     */
    function setPoolFundsManager(address _pool, address _newFundsManager)
        external
        onlyAdmin
        validateRequest("setPoolFundsManager", abi.encodePacked(_pool, _newFundsManager))
    {
        require(pools[_pool], "Loaner: Pool was not created from the pool factory");
        ILoanerPool pool = ILoanerPool(_pool);
        pool.setFundsManager(_newFundsManager);
    }

    /**
     * @dev Set the community pool factory address, if the contract is valid.
     */
    function setLoanerPoolFactory(address _loanerPoolFactory)
        external
        onlyAdmin
        validateRequest(
            "setLoanerPoolFactory",
            abi.encodePacked(_loanerPoolFactory)
        )
    {
        ILoanerPoolFactory factory = ILoanerPoolFactory(_loanerPoolFactory);
        require(factory.loanerAddress() == address(this), "NOT_ALLOWED");
        loanerPoolFactory = _loanerPoolFactory;
        emit PoolFactoryChanged(_loanerPoolFactory);
    }

    /**
     * @dev Init pool factory, used only at deploy time.
     */
    function initPoolFactory(address _loanerPoolFactory)
        external
    {
        require(loanerPoolFactory == address(0), "");
        loanerPoolFactory = _loanerPoolFactory;
        emit PoolFactoryChanged(_loanerPoolFactory);
    }


    /**
     * @dev Set the community factory address, if the contract is valid.
     */
    function setCommunityFactory(address _communityFactory)
        external
        onlyAdmin
        validateRequest(
            "setCommunityFactory",
            abi.encodePacked(_communityFactory)
        )
    {
        ICommunityFactory factory = ICommunityFactory(_communityFactory);
        require(factory.loanerAddress() == address(this), "NOT_ALLOWED");
        communityFactory = _communityFactory;
        emit CommunityFactoryChanged(_communityFactory);
    }

    /**
     * @dev Init community factory, used only at deploy time.
     */
    function initCommunityFactory(address _communityFactory)
        external
    {
        require(communityFactory == address(0), "");
        communityFactory = _communityFactory;
        emit CommunityFactoryChanged(_communityFactory);
    }

    /**
     * @dev Set the loan factory address, if the contract is valid.
     */
     function setLoanFactory(address _loanFactory)
        external
        onlyAdmin
        validateRequest(
            "setLoanFactory",
            abi.encodePacked(_loanFactory)
        )
    {
        ILoanFactory factory = ILoanFactory(_loanFactory);
        require(factory.loanerAddress() == address(this), "Loaner: factory does not have loaner address");
        loanFactory = _loanFactory;
        emit LoanFactoryChanged(_loanFactory);
    }

    /**
     * @dev Init loan factory, used only at deploy time.
     */
    function initLoanFactory(address _loanFactory)
        external
    {
        require(loanFactory == address(0), "Loaner: Loan factory already initialized");
        loanFactory = _loanFactory;
        emit LoanFactoryChanged(_loanFactory);
    }
}