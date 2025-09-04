start redis windowpowshell:Ổ đĩa chứa redis .\redis-server.exe .\redis.windows.conf
check backlist refresh token : KEYS refresh_blacklist:*
Cơ chế thưc hiên chỉ lưu refresh token vao backlist 
còn access để tự hết hạn(Thêm vào backlist khi user bị block )