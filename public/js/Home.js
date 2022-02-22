fetch('/current').then(result=>{
    if(result.status===401) return;
    return result.json();
}).then(json=>{
    if(json) location.replace('/profile');
})