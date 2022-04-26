const field = document.getElementById("field");
const mixBtn = document.getElementById("mix-btn");
const items = [...field.querySelectorAll(".fifteen__item")];
const values = items.map(item => +item.dataset.value);  
const itemsNum = 16;
const blockedCoords = {x: -1, y: -1};
let isGameOver = false;

if(items.length !== itemsNum)
    throw new Error("Должно быть 16 квадратов!");

items[itemsNum-1].style.display = "none";

const shuffleValues = () => [...values].sort(() => Math.random() - .5);
const matrix = formMatrix();
shuffleItems();

document.addEventListener("keydown", onKeyDown);
field.addEventListener("click", moveItem);
field.addEventListener("transitionend", onStylingVictoryEnd);
mixBtn.addEventListener("click", shuffleItems);

function formMatrix()
{
    const arr = [[], [], [], []];  
    
    fillMatrix(arr, values);        

    return arr;    
}

function fillMatrix(arr, values)
{
    for(let i = 0; i < itemsNum; i++)
    {        
        arr[~~(i/4)][i%4] = values[i];
    }  
}

function placeItems()
{
    matrix.forEach((arr, i) =>
    {
        arr.forEach((val, j) =>
        {
            setItemStyle(j, i, val - 1);
        });
    });    
}

function setItemStyle(x, y, index)
{    
    items[index].style.transform = `translate3d(${x * 100}%, ${y * 100}%, 0)`;
}

function onKeyDown(e)
{
    const key = e.key;

    if(!key.includes("Arrow") || isGameOver) return;  

    const blankCoords = getCoords(itemsNum); 
    const {x: xTo, y: yTo} = blankCoords;
    let x = xTo;
    let y = yTo;

    switch(key)
    {
        case "ArrowUp": y++; break;
        case "ArrowRight": x--; break;
        case "ArrowDown": y--; break;

        default: x++;
    }

    if(!isValidForSwap(x, xTo, y, yTo)) return;   

    swapItems({x, y, xTo, yTo});    

}

function moveItem(e)
{
    const item = e.target.closest("[data-value]");

    if(!item || isGameOver) return;     

    const value = +item.dataset.value;
    const {x: xTo, y: yTo} = getCoords(itemsNum); 
    const {x, y} = getCoords(value);        

    if(!isValidForSwap(x, xTo, y, yTo)) return;  

    swapItems({x, y, xTo, yTo});
    
}

function onStylingVictoryEnd()
{
    if(isGameOver)
        mixBtn.innerText = "Победа!"; 
}

function shuffleItems()
{
    for(let i = 0; i < 100; i++)
    {
        const {x: xTo, y: yTo } = getCoords(itemsNum);  
        const validSwaps = getValidSwaps(xTo, yTo);
        const {x, y} = validSwaps[
            Math.floor(Math.random() * validSwaps.length)
        ];

        swapItems({x, y, xTo, yTo}, true);
    }

    placeItems();  
    
    if(isGameOver)
    {        
        isGameOver = false;

        mixBtn.innerText = "Перемешать";
        field.classList.remove("fifteen_victory");
    }
    
}

function getValidSwaps(xTo, yTo)
{
    const arr = [];       

    if(
          isValidForSwap(xTo + 1, xTo, yTo, yTo) &&
          blockedCoords.x !== xTo + 1
      )
        arr.push({x: xTo + 1, y: yTo});

    if(
        isValidForSwap(xTo - 1, xTo, yTo, yTo) &&
        blockedCoords.x !== xTo - 1
      )
        arr.push({x: xTo - 1, y: yTo});

    if(
        isValidForSwap(xTo, xTo, yTo + 1, yTo) &&
        blockedCoords.y !== yTo + 1
      )
        arr.push({x: xTo, y: yTo + 1});

    if(
        isValidForSwap(xTo, xTo, yTo - 1, yTo) &&
        blockedCoords.y !== yTo - 1
      )
        arr.push({x: xTo, y: yTo - 1});    

    blockedCoords.x = xTo;
    blockedCoords.y = yTo;

    return arr;
}

function isValidForSwap(x, xTo, y, yTo)
{
    const diffX = Math.abs(x - xTo);
    const diffY = Math.abs(y - yTo);

    return (diffX === 1 || diffY === 1) &&
           (x === xTo || y === yTo) &&
           (x >= 0 && x <= 3) &&
           (y >= 0 && y <= 3);
}

function swapItems({x, y, xTo, yTo}, isMix = false)
{
    const value = matrix[y][x];
    const valueTo = matrix[yTo][xTo];
    const temp = matrix[yTo][xTo];

    matrix[yTo][xTo] = matrix[y][x];
    matrix[y][x] = temp;

    if(isMix) return;

    setItemStyle(x, y, valueTo - 1);
    setItemStyle(xTo, yTo, value - 1);

    if(isVictory())
    {
        isGameOver = true;
        
        field.classList.add("fifteen_victory");
    } 
    
    
}

function getCoords(value)
{
    for(let y = 0; y < itemsNum; y++)    
        for(let x = 0; x < matrix[y].length; x++)
        {            
            if(matrix[y][x] === value) return {x, y};            
        }
}

function isVictory()
{
    for(let i=0; i < itemsNum; i++)
        if(matrix[~~(i/4)][i%4] !== values[i]) return false;

    return true;
}