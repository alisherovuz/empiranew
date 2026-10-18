begin;
do $$
begin
  if not public.empira_take_rate_limit('test',2,60) then raise exception 'first request blocked'; end if;
  if not public.empira_take_rate_limit('test',2,60) then raise exception 'second request blocked'; end if;
  if public.empira_take_rate_limit('test',2,60) then raise exception 'limit bypassed'; end if;
  if not public.empira_issue_telegram_code('123456',123,'tester','Test') then raise exception 'issuance failed'; end if;
  if public.empira_consume_telegram_code('123456')->>'telegram_id' <> '123' then raise exception 'wrong identity'; end if;
  if public.empira_consume_telegram_code('123456') is not null then raise exception 'OTP reused'; end if;
  perform public.empira_issue_telegram_code('123457',123,null,'Test');
  perform public.empira_issue_telegram_code('123458',123,null,'Test');
  if public.empira_consume_telegram_code('123457') is not null then raise exception 'old OTP still active'; end if;
end $$;
set local role anon;
do $$
begin
  begin
    perform public.empira_consume_telegram_code('123458');
    raise exception 'anonymous OTP consumption allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
insert into public.lab_progress(user_id,lab_id,mode,snapshot) values(auth.uid(),'om-qonuni','build','{"version":1}');
do $$
begin
  begin
    insert into public.lab_progress(user_id,lab_id,mode,snapshot)
    values('00000000-0000-0000-0000-000000000002','om-qonuni','build','{"version":1}');
    raise exception 'cross-user write allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin
  if exists(select 1 from public.lab_progress) then raise exception 'cross-user read allowed'; end if;
end $$;
rollback;
