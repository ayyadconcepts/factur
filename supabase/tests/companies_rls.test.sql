begin;
select plan(7);

-- Create mock users for RLS testing
select tests.create_supabase_user('userA');
select tests.create_supabase_user('userB');

-- Test 1: userA can create a company
select tests.authenticate_as('userA');
select lives_ok(
  $$ select public.create_company('Company A', '12345678901234') $$,
  'userA can create a company'
);

-- Test 2: userA can read the created company
select isnt_empty(
  $$ select * from public.companies where name = 'Company A' $$,
  'userA can read their own company'
);

-- Test 3: userB cannot read userA's company
select tests.authenticate_as('userB');
select is_empty(
  $$ select * from public.companies where name = 'Company A' $$,
  'userB cannot read userA company due to RLS'
);

-- Test 4: userB can create their own company
select lives_ok(
  $$ select public.create_company('Company B', '98765432109876') $$,
  'userB can create their own company'
);

-- Test 5: userB can read their own company
select isnt_empty(
  $$ select * from public.companies where name = 'Company B' $$,
  'userB can read their own company'
);

-- Test 6: userA cannot read userB's company
select tests.authenticate_as('userA');
select is_empty(
  $$ select * from public.companies where name = 'Company B' $$,
  'userA cannot read userB company due to RLS'
);

-- Test 7: userA cannot create a company with a duplicate SIRET
select throws_ok(
  $$ select public.create_company('Company A Dup', '12345678901234') $$,
  '23505', -- unique_violation code
  null,
  'userA cannot create a duplicate SIRET'
);

select * from finish();
rollback;
