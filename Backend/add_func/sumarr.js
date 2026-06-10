function sumarr(arr){
    let l = arr.length;
    let sum=0;
    for(let i =0; i<l;i++){
        sum+=arr[i];
    }
    return sum;
}
module.exports= sumarr;