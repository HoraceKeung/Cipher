window. onload = function ()
{
    
}
function getKey()
{
    var key = document.getElementById('key').value;
    var k =key.split("?");
    k[2] = parseInt(k[2]);
    k[4] = k[4].split(",");
    for(i=0;i<k[4].length;i++)
    {
        k[4][i] = parseInt(k[4][i]);
    }
    return k;
}
function encrypt()
{
    var k = getKey();
    var m =document.getElementById('message').value;
    var c = caeserCipher(m, k[0],true);
    var c2 = transpositionCipher(c, k[1], k[2]);
    var b = stringToBinary(c2);
    var sc = streamCipher(b,k[3],k[4]);
    var flipC = flipBits(sc);
    document.getElementById("output").innerHTML = "Cipher: "+flipC;
}
function decrypt()
{
    var k = getKey();
    var c = document.getElementById('message').value;
    var flipC = flipBits(c);
    var b = streamCipher(flipC,k[3],k[4]);
    var str = binaryToString(b);
    var m1 = removePad(transpositionCipher(str, inverseP(k[1]), k[2]));
    var m2 = caeserCipher(m1,k[0],false);
    document.getElementById("output").innerHTML = "Message: "+m2;
}
function flipBits(input)
{
    var output = "";
    var is = input.split("");
    var counter = 0;
    for(i in is)
    {
        if(is[i] == "1")
        {
            counter+=1;
        }
    }
    if(counter%2 == 0)
    {

        return input;
    }
    else
    {
        for(i in is)
        {
            output += flipBit(is[i]);
        }
        return output;
    }
}
function flipBit(input)
{
    return (input == "1"? "0" : "1");
}
function streamCipher(m,key,taps)
{
    var output = [];
    var keyStream = keyStreamGenerator(key,taps,m.length);
    var bits = m.split("");
    for(i=0;i<bits.length;i++)
    {
        output[i] = XOR(parseInt(bits[i]),keyStream[i]);
    }
    return output.join("");
}
function keyStreamGenerator(key,taps,m_length)
{
    var register = key.split("");
    for(r=0;r<register.length;r++)
    {
        register[r] = parseInt(register[r]);
    }
    var output = [];
    for(i=0;i<m_length;i++)
    {
        if(i<m_length-register.length)
        {
            var nextBit = register[taps[0]-1];
            for(j=1;j<taps.length;j++)
            {
                nextBit = XOR(nextBit,register[taps[j]-1]);
            }
            register.push(nextBit);
        }
        output[i] = register.shift();
    }
    return output;
}
function reset()
{
    document.getElementById("message").value = "";
    document.getElementById("output").innerHTML = "";
}
function stringToBinary(input)
{
    var output = "";
    for(i=0; i < input.length; i++)
    {
        var temp = input[i].charCodeAt(0).toString(2);
        var numOfPadding = 8-temp.length;
        for(j=0; j<numOfPadding;j++)
        {
            output += "0";
        }
        output += temp;
    }
    return output;
}
function binaryToString(input)
{
    return input.replace(/[01]{8}/g, function(v){
        return String.fromCharCode(parseInt(v,2));
    });
}
function caeserCipher(m,key,encrypt)
{
    var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    var Alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    var shift_num = (encrypt? alphabet.indexOf(key) : 26-alphabet.indexOf(key));
    var m_split = m.split("");
    var c = [];
    for(i = 0; i<m_split.length; i++)
    {
        if(/[a-z]/.test(m_split[i]))
        {
            var new_index = alphabet.indexOf(m_split[i]) + shift_num;
            c[i] = alphabet[new_index%26];
        }
        else if(/[A-Z]/.test(m_split[i]))
        {
            var new_index = Alphabet.indexOf(m_split[i]) + shift_num;
            c[i] = Alphabet[new_index%26];
        }
        else
        {
            c[i] = m_split[i];
        }
    }
    return c.join("");
}
function transpositionCipher(m, k, p)
{
    var pad_m = m;
    if (m.length%p != 0)
    {
        for (i = 0; i<(p-m.length%p); i++)
        {
            pad_m += " ";
        }
    }
    var table = [];
    for(i=1;i<p+1;i++)
    {
        table[i]=i;
    }
    var k_arr = k.split("");
    var head;
    for(i=0;i<k_arr.length;i++)
    {
        if(/\d/.test(k_arr[i]))
        {
            if(/\d/.test(k_arr[i+1]))
            {
                table[k_arr[i]] = parseInt(k_arr[i+1]);
            }
            else
            {
                table[k_arr[i]] = head;
            }
        }
        else if(k_arr[i] == "(")
        {
            head = parseInt(k_arr[i+1]);
        }
    }
    var pad_m_split = pad_m.split("");
    var numOfBlock = pad_m_split.length/p;
    var c =[];
    for(i=0;i<numOfBlock;i++)
    {
        for(j=0;j<p;j++)
        {
            var currentCharIndex = i*p+j;
            var targetCharIndex = i*p+table[j+1];
            c[targetCharIndex] = pad_m_split[currentCharIndex];
        }

    }
    return c.join("");
}
function XOR(a,b)
{
    return (a != b? 1 : 0);
}
function inverseP(key)
{
    var output = "";
    var k = key.slice(1,-1).split(")(");
    for(i=0;i<k.length;i++)
    {
        output += "(";
        var temp = k[i].split("");
        output += temp.shift();
        output += temp.reverse().join("");
        output += ")";
    }
    return output;
}
function removePad(m)
{
    var m_arr = m.split("");
    var done = false;
    var index = m_arr.length-1;
    var counter = 0;
    while(!done)
    {
        if(m_arr[index] == " ")
        {
            counter+=1;
            index-=1;
        }
        else
        {
            done = true;
        }
    }
    return m.slice(0,m.length-counter)
}