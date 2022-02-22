const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click',(evt)=>{
    fetch('/logout').then(result=>{
        location.replace('/');
    })
})