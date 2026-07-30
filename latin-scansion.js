const mute = "bcdfgkpt"; //erm check this
const liquid = "lr";
const vowels = "aeiouy";

function removePunc(line)
{
    const punc = ".,;:!?()\"'";
    let newLine = "";

    for (const letter of line)
    {
        if (punc.indexOf(letter) == -1)
        {
            newLine += letter;
        }
    }

    return {new: newLine.toLowerCase(), old: newLine};
}

function handleI(line, index)
{
    if (line[index] != "i")
    {
        return false;
    }

    else if (index > 0 && vowels.includes(line[index - 1]) && vowels.includes(nextChar(line, index, 1)))
    {
        return "double";
    }
    
    else if ((index === 0 || line[index - 1] === " ") && vowels.includes(nextChar(line, index, 1)))
    {
        return "single";
    }

    return false;
}

function removeElision(line)
{
    let copy = line;
    let listElision = [];
    const others = ["um", "em", "am"];
    const dipthongs = ["ae", "au", "ei", "oe"];
    let spaceIndex = copy.indexOf(" ");
    let startElision = [];
    let endElision = [];

    while (spaceIndex != -1)
    {
        let nextSpace = copy.indexOf(" ", spaceIndex + 1);

        // checks of elisions with m and dipthongs
        if (spaceIndex >= 2 && (others.includes(copy.slice(spaceIndex - 2, spaceIndex)) || dipthongs.includes(copy.slice(spaceIndex - 2, spaceIndex))))
        {

            //checks if I is consonant or not
            // checks est es elision
            if (spaceIndex < copy.length - 3 && copy.slice(spaceIndex + 1, spaceIndex + 4) === "est" && (nextSpace === spaceIndex + 4 || nextSpace == -1)
            || copy.slice(spaceIndex + 1, spaceIndex + 3)=== "es" && (nextSpace === spaceIndex + 3 || nextSpace == -1))
            {
                startElision.push(spaceIndex + 1);
                endElision.push(spaceIndex + 2);
            }

            else if (vowels.includes(copy[spaceIndex + 1]) && handleI(copy, spaceIndex + 1) === false)
            {
                startElision.push(spaceIndex - 2);
                endElision.push(spaceIndex);
            }

            // checks h elision
            else if (spaceIndex <= copy.length - 3 && copy[spaceIndex + 1] === "h" && vowels.includes(copy[spaceIndex + 2]))
            {
                startElision.push(spaceIndex - 2);
                endElision.push(spaceIndex);
            }
        }

        //checks elisions with single letter 
        else if (vowels.includes(copy[spaceIndex - 1]))
        {
            if (spaceIndex < copy.length - 3 && copy.slice(spaceIndex + 1, spaceIndex + 4) === "est" && (nextSpace === spaceIndex + 4 || nextSpace === -1)
            || copy.slice(spaceIndex + 1, spaceIndex + 3)=== "es" && (nextSpace === spaceIndex + 3 || nextSpace === -1))
            {
                startElision.push(spaceIndex + 1);
                endElision.push(spaceIndex + 2);
            }
            else if (vowels.includes(copy[spaceIndex + 1]) && handleI(copy, spaceIndex + 1) === false)
            {
                startElision.push(spaceIndex - 1);
                endElision.push(spaceIndex);
            }

            else if (spaceIndex <= copy.length - 3 && copy[spaceIndex + 1] === "h" && vowels.includes(copy[spaceIndex + 2]))
            {
                startElision.push(spaceIndex - 1);
                endElision.push(spaceIndex);
            }
        }
        spaceIndex = copy.indexOf(" ", spaceIndex + 1);
    }

    return {start: startElision, end: endElision};
}

function splitByVowel(line, startE, endE)
{
    const dipthongs = ["ae", "au", "ei", "oe"];
    let i = 0;
    let newString = [];

   while (i < line.length)
   {
        if (
        line.length - i >= 2
        && dipthongs.includes(line.slice(i, i + 2))
        && !(line[i] === "u" && i > 0
            && (line[i - 1] === "q" || line[i - 1] === "g"))
)
        {
            if (startE.includes(i))
            {
                let arrIndex = startE.indexOf(i);
                i += Math.abs(endE[arrIndex] - startE[arrIndex]);
            }

            else
            {
                newString.push(
                {
                    vowel: line.slice(i, i+2),
                    index: i,
                    end: i + 2,
                    dipthong: true,
                    mark: ""
                });
                i += 2;
            }
        }

        else if (vowels.includes(line[i]))
        {

            if (line[i] === "i" && handleI(line, i) !== false)
            {
                i++;
            }
            
            else if (i != 0 && line[i] === "u" && line[i - 1] === "q" || i > 1 && line[i - 2] === "n" && line[i - 1] === "g")
            {
                i++;
            }

            else if (startE.includes(i))
            {
                let arrIndex = startE.indexOf(i);
                i += Math.abs(endE[arrIndex] - startE[arrIndex]);
            }

            else
            {
                newString.push
                (
                    {
                        vowel: line[i],
                        index: i,
                        end: i + 1,
                        dipthong: false,
                        mark: ""
                    }
                );

                i++;
            }
        }

        else
        {
            i++;
        }
   }

   return newString;
}

function nextChar(line, index, n)
{
    let count = 0;
    let i = index + 1;

    while (i < line.length)
    {
        if (line[i] !== " ")
        {
            count++;
            if (count === n)
            {
                return line[i];
            }
        }
        i++;
    }

    return undefined;
}

function shortLong(line, arr)
{
    arr[arr.length - 1].mark = "anceps";
    arr[arr.length - 2].mark = "long";
    arr[arr.length - 3].mark = "short";
    arr[arr.length - 4].mark = "short";
    arr[arr.length - 5].mark = "long";

    for (let i = 0; i < arr.length - 5; i++)
    {
        let current = arr[i];
        if (current.dipthong === true)
        {
            current.mark = "long";
        }

        else if (handleI(line, current.index) === "double")
        {
            current.mark = "long";
        }

        else if (current.index < line.length - 2 && mute.includes(nextChar(line, current.index, 1)) && liquid.includes(nextChar(line, current.index, 2)) && 
        nextChar(line, current.index, 1) != "t" && nextChar(line, current.index, 2) != "l")// fix this
        
        {
            current.mark = "unknown";
        }

        // treat x and z as double consonant
        else if (current.index <= line.length - 2 && (nextChar(line, current.index, 1) === "x" || nextChar(line, current.index, 1) === "z") || nextChar(line, current.index, 1) === "J")
        {
            current.mark = "long";
        }

        else if (current.index < line.length - 2 && !vowels.includes(nextChar(line, current.index, 1)) && !vowels.includes(nextChar(line, current.index, 2))
        && nextChar(line, current.index, 1) !== "h" && nextChar(line, current.index, 2) !== "h")
        {
            current.mark = "long";
        }

        // add conditional - two vowels = shorts - if the previous vowel right next to it is short ** 
        else if (i > 0 && current.index - 1 == arr[i - 1].index)
        {
            current.mark = "short";
            arr[i - 1].mark = "short";
        }

        else
        {
            current.mark = "unknown";
        }
    }

    return arr;
}

function checkUnknown(line, arr)
{
    const mixes = [
        {nuclei: 8, dactyls: 0, spondees: 4},
        {nuclei: 9, dactyls: 1, spondees: 3},
        {nuclei: 10, dactyls: 2, spondees: 2},
        {nuclei: 11, dactyls: 3, spondees: 1},
        {nuclei: 12, dactyls: 4, spondees: 0}
    ]

    let mix = {};

    let nuclei = arr.length - 5;

    // sets pattern with _ ? _ to long
    for (let i = 0; i < arr.length - 5; i++)
    {
        let current = arr[i];
        let third = arr[i + 2];

        if (current.mark === "long" && third.mark === "long")
        {
            arr[i + 1].mark = "long";
        }
    }

    // calculates how many spondees/dactyls are in the first four feet
    for (let i = 0; i < 5; i++)
    {
        if (mixes[i].nuclei === nuclei)
        {
            mix = mixes[i];
        }
    }

    // tests the different cases

    // all spondees
    if (mix.dactyls === 0)
    {
        let feet = [];
        for (let i = 0; i < arr.length - 5; i++)
        {
            arr[i].mark = "long";
        }

        return {line: line, arr: arr, pattern: ["S", "S", "S", "S", "D"]};
    }

    // all dactyls
    else if (mix.dactyls === 4)
    {
        for (let i = 0; i < arr.length - 5; i += 3)
        {
            arr[i].mark = "long";
            arr[i + 1].mark = "short";
            arr[i + 2].mark = "short";
        }

        return {line: line, arr: arr, pattern: ["D", "D", "D", "D", "D"]};
    }

    // one dactyl
    else if (mix.dactyls === 1)
    {
        let pattern = ["S", "S", "S", "S"];

        for (let j = 0; j < pattern.length; j++)
        {
            pattern = ["S", "S", "S", "S"];

            pattern[j] = "D"
            let i = 0;
            let indexMark = 0;
            let matches = true;

            while (matches && indexMark < pattern.length)
            {
                if (pattern[indexMark] === "D")
                {

                    if (arr[i+1].mark === "long" || arr[i+2].mark === "long")
                    {
                        matches = false;
                    }

                    i += 3;
                }

                else if (pattern[indexMark] === "S")
                {
                    i += 2;
                }

                indexMark++;
            }

            i = 0;
            indexMark = 0;

            if (matches === true)
            {
                while (indexMark < pattern.length)
                {
                    if (pattern[indexMark] === "D")
                    {
                        arr[i].mark = "long";
                        arr[i + 1].mark = "short";
                        arr[i + 2].mark = "short";
                        
                        i += 3;
                    }

                    else if (pattern[indexMark] === "S")
                    {
                        arr[i].mark = "long";
                        arr[i + 1].mark = "long";

                        i += 2;
                    }

                    indexMark++;
                }

                 pattern.push("D");

                return {line: line, arr: arr, pattern: pattern};
            }
        }
    }

    // two dactyls
    else if (mix.dactyls === 2)
    {
        let pattern = ["S", "S", "S", "S"];

        for (let i = 0; i < pattern.length; i++)
        {

            for (let j = i + 1; j < pattern.length; j++)
            {
                let index = 0;
                let indexMark = 0;
                let matches = true;

                pattern = ["S", "S", "S", "S"];
                pattern[i] = "D";
                pattern[j] = "D";

                while (matches && indexMark < pattern.length)
                {
                    if (pattern[indexMark] === "D")
                    {

                        if (arr[index+1].mark === "long" || arr[index+2].mark === "long")
                        {
                            matches = false;
                        }

                        index += 3;
                    }

                    else if (pattern[indexMark] === "S")
                    {
                        index += 2;
                    }

                    indexMark++;
                }

                index = 0;
                indexMark = 0;

                if (matches === true)
                {
                    while (indexMark < pattern.length)
                    {
                        if (pattern[indexMark] === "D")
                        {
                            arr[index].mark = "long";
                            arr[index + 1].mark = "short";
                            arr[index + 2].mark = "short";
                            
                            index += 3;
                        }

                        else if (pattern[indexMark] === "S")
                        {
                            arr[index].mark = "long";
                            arr[index + 1].mark = "long";

                            index += 2;
                        }

                        indexMark++;
                    }

                    pattern.push("D");
                    return {line: line, arr: arr, pattern: pattern};
                }
            }
        }
    }

    // three dactyls
    else if (mix.dactyls === 3)
    {
        let pattern = ["D", "D", "D", "D"];

        for (let j = 0; j < pattern.length; j++)
        {
            pattern = ["D", "D", "D", "D"];

            pattern[j] = "S"
            let i = 0;
            let indexMark = 0;
            let matches = true;

            while (matches && indexMark < pattern.length)
            {
                if (pattern[indexMark] === "D")
                {

                    if (arr[i+1].mark === "long" || arr[i+2].mark === "long")
                    {
                        matches = false;
                    }

                    i += 3;
                }

                else if (pattern[indexMark] === "S")
                {
                    i += 2;
                }

                indexMark++;
            }

            i = 0;
            indexMark = 0;

            if (matches === true)
            {
                while (indexMark < pattern.length)
                {
                    if (pattern[indexMark] === "D")
                    {
                        arr[i].mark = "long";
                        arr[i + 1].mark = "short";
                        arr[i + 2].mark = "short";
                        
                        i += 3;
                    }

                    else if (pattern[indexMark] === "S")
                    {
                        arr[i].mark = "long";
                        arr[i + 1].mark = "long";

                        i += 2;
                    }

                    indexMark++;
                }

                pattern.push("D");
                return {line: line, arr: arr, pattern: pattern};
            }
        }
    }
}

function returnScanned(info, ogLine, startE, endE)
{
    let final = "";
    let vowelIndex = 0;
    let patternIndex = 0;
    let footIndexCurrent = 0;
    let meter = "";
    let elisionIndex = 0;

    for (let i = 0; i < info.line.length; i++)
    {
        if (vowelIndex < info.arr.length && i === info.arr[vowelIndex].index)
        {
            final += ogLine[i];
            if (info.arr[vowelIndex].mark === "long")
            {
                final += "\u0304";
                meter += "- ";
            }

            else if (info.arr[vowelIndex].mark === "short")
            {
                final += "\u0306";
                meter += " \u23D1";
            }

            else
            {
                final += "\u033D";
                meter += "x ";
            }

            footIndexCurrent++;
            vowelIndex++;


            if (patternIndex < info.pattern.length && info.pattern[patternIndex] === "D" && footIndexCurrent === 3)
            {
                footIndexCurrent = 0;
                patternIndex++;
                meter += "| ";
            }

            else if (patternIndex < info.pattern.length && info.pattern[patternIndex] === "S" && footIndexCurrent === 2)
            {
                footIndexCurrent = 0;
                patternIndex++;
                meter += "| ";
            }
            
            else if (patternIndex < info.pattern.length && info.pattern[patternIndex] === "L" && footIndexCurrent === 1)
            {
                footIndexCurrent = 0;
                patternIndex++;
                meter += "|| ";
            }
        }

        else if (elisionIndex < startE.length && startE.includes(i))
        {
            let arrIndex = startE.indexOf(i);
            final += "(" + ogLine.slice(i, endE[arrIndex]) + ")";
            i += Math.abs(endE[arrIndex] - startE[arrIndex] - 1);
        }

        else
        {
            final += ogLine[i];
        }
    }

    return {final: final, meter: meter};
}

function dactylicHexameter(line, index)
{
    const noPunc = removePunc(line);
    const noElis = removeElision(noPunc.new);
    const vowelSplit = splitByVowel(noPunc.new, noElis.start, noElis.end);
    const first = shortLong(noPunc.new, vowelSplit);
    const last = checkUnknown(noPunc.new, first);

    return returnScanned(last, noPunc.old, noElis.start, noElis.end);
}

function elegaicCouplet(line, index)
{
    if (index % 2 == 0)
    {
        return dactylicHexameter(line);
    }

    else if (index % 2 != 0)
    {
        const noPunc = removePunc(line);
        const noElis = removeElision(noPunc.new);
        const vowels = splitByVowel(noPunc.new, noElis.start, noElis.end);

        const long = [0, 3, 6, 7, 10];
        const short = [1, 2, 4, 5, 8, 9, 11, 12];

        for (let i = 0; i < vowels.length; i++)
        {
            if (long.includes(i))
            {
                vowels[i].mark = "long";
            }

            else if (short.includes(i))
            {
                vowels[i].mark = "short";
            }

            else
            {
                vowels[i].mark = "anceps";
            }
        }

        return returnScanned({line: line, arr: vowels, pattern: ["D","D", "L", "D", "D"]}, noPunc.old, noElis.start, noElis.end);
    }
};

const text = document.getElementById("paste-text");
const scanButton = document.getElementById("scan-button");
const output = document.getElementById("output");
const dactylic = document.getElementById("dactylic-hexameter");
const elegaic = document.getElementById("elegaic-couplets");
let mode = "";

dactylic.addEventListener("click", function()
{
    mode = dactylicHexameter; // check if valid
});

elegaic.addEventListener("click", function()
{
    mode = elegaicCouplet;
});

scanButton.addEventListener("click", function()
{
    const lines = text.value.split(/\r?\n/);

    output.replaceChildren();

    for (let i = 0; i < lines.length; i++)
    {
        lines[i] = lines[i].trim();

        if (lines[i] === "")
        {
            continue;
        }

        const scannedLine = document.createElement("div");
        scannedLine.textContent = mode(lines[i], i).final;

        const meter = document.createElement("div");
        meter.textContent = mode(lines[i], i).meter;

        output.append(meter, scannedLine);
    }
});