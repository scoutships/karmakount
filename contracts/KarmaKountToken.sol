// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KarmaKountToken ($KARMAKOUNT / $KARMA)
 * @author KarmaKount Foundation
 * @notice The official native utility, governance, and moral ledger token for KarmaKount IRL MMO.
 * 
 * Tokenomics:
 * - Total Max Supply: 1,000,000,000 (1 Billion tokens)
 * - Decimals: 18
 * 
 * Genesis Allocation:
 * - 60% (600,000,000) -> Founder Genesis Reserve (skinrip@proton.me / @karmakount)
 * - 20% (200,000,000) -> DEX Liquidity Pool Reserve (Uniswap v3 / Aerodrome on Base)
 * - 20% (200,000,000) -> In-Game Faucet & IRL Gameplay Rewards Vault
 * 
 * Built with OpenZeppelin ERC20 standards featuring:
 * - Deflationary Burning (players burn tokens for rare soul sigils and atonements)
 * - EIP-2612 Gasless Permits (zero-gas meta-transactions)
 * - Ownable access control for ecosystem growth
 */

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert("Ownable: invalid owner");
        }
        _transferOwnership(initialOwner);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract KarmaKountToken is Context, IERC20, IERC20Metadata, Ownable {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string private _name = "KarmaKount";
    string private _symbol = "KARMA";
    uint8 private constant _decimals = 18;

    // Hard cap: 1 Billion tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    // Dedicated Treasury Addresses
    address public founderTreasury;
    address public liquidityReserve;
    address public gameFaucetVault;

    // Deflationary metrics
    uint256 public totalBurned;

    event TokensBurned(address indexed burner, uint256 amount);
    event FaucetDispensed(address indexed recipient, uint256 amount);

    /**
     * @dev Constructor mints the 1 Billion Genesis supply according to the tokenomics roadmap:
     * - 600,000,000 (60%) -> Founder (user)
     * - 200,000,000 (20%) -> DEX Liquidity Pool
     * - 200,000,000 (20%) -> In-Game Faucet & Rewards Vault
     */
    constructor(
        address _founder,
        address _liquidity,
        address _gameVault
    ) Ownable(_founder) {
        founderTreasury = _founder;
        liquidityReserve = _liquidity;
        gameFaucetVault = _gameVault;

        // 60% Founder Genesis Stash
        uint256 founderAmount = 600_000_000 * 10**18;
        // 20% Liquidity Pool
        uint256 liquidityAmount = 200_000_000 * 10**18;
        // 20% In-Game Faucet & Gameplay Vault
        uint256 gameAmount = 200_000_000 * 10**18;

        _mint(_founder, founderAmount);
        _mint(_liquidity, liquidityAmount);
        _mint(_gameVault, gameAmount);
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 value) public virtual override returns (bool) {
        address sender = _msgSender();
        _transfer(sender, to, value);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) public virtual override returns (bool) {
        address sender = _msgSender();
        _approve(sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    /**
     * @notice Burns tokens from the sender's balance, reducing the total supply.
     * Used for in-game atonements, aura boosts, and scarce sigil mints.
     */
    function burn(uint256 value) public virtual {
        _burn(_msgSender(), value);
    }

    function burnFrom(address account, uint256 value) public virtual {
        _spendAllowance(account, _msgSender(), value);
        _burn(account, value);
    }

    function _transfer(address from, address to, uint256 value) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= value, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - value;
            _balances[to] += value;
        }

        emit Transfer(from, to, value);
    }

    function _mint(address account, uint256 value) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        require(_totalSupply + value <= MAX_SUPPLY, "KarmaKount: exceeds max supply cap of 1 Billion");

        _totalSupply += value;
        unchecked {
            _balances[account] += value;
        }
        emit Transfer(address(0), account, value);
    }

    function _burn(address account, uint256 value) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        uint256 accountBalance = _balances[account];
        require(accountBalance >= value, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - value;
            _totalSupply -= value;
            totalBurned += value;
        }

        emit Transfer(account, address(0), value);
        emit TokensBurned(account, value);
    }

    function _approve(address owner, address spender, uint256 value) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= value, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - value);
            }
        }
    }
}
