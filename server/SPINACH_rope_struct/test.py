import spinach_rope as r

#
a = r.rope("hello,")
b = r.rope(" world")
c = r.rope(" 你好世界！")

# print(r.strconcat("de","dejujijijijij"))
# print(a.get_str() + b.get_str())

d = r.concat(a, b)
print(d.get_str())
print(r.concat(d, c).get_str())
